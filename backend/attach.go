package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"golang.org/x/sync/errgroup"
)

func (app *App) attach(w http.ResponseWriter, r *http.Request) {
	userID := UserID(uuid.NewString())
	log.Printf("attach for %q\n", userID)
	conn, err := app.upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer func() {
		conn.Close()
	}()

	ctx := context.Background()
	containerID, err := app.reserveSpotContainer(ctx, userID)
	if err != nil {
		panic(err)
	}
	defer app.releaseSpotContainer(containerID)

	execResp, err := app.client.ContainerExecCreate(ctx, string(containerID), types.ExecConfig{
		Tty:          true,
		AttachStdin:  true,
		AttachStderr: true,
		AttachStdout: true,
		Detach:       true,
		Cmd:          []string{"bash"},
	})
	if err != nil {
		panic(err)
	}

	app.lock.Lock()
	app.users[userID] = &UserInfo{
		ExecID:  ExecID(execResp.ID),
		Channel: nil,
	}
	app.lock.Unlock()

	// send the user id
	if err := conn.WriteMessage(websocket.TextMessage, []byte(userID)); err != nil {
		panic(err)
	}

	attachResp, err := app.client.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{
		Detach: true,
		Tty:    true,
	})
	if err != nil {
		panic(err)
	}
	defer attachResp.Close()

	if err := app.client.ContainerExecStart(ctx, execResp.ID, types.ExecStartCheck{
		Detach: true,
		Tty:    true,
	}); err != nil {
		panic(err)
	}

	var g errgroup.Group

	// read from the container, and write to the socket
	g.Go(func() error {
		defer conn.Close()
		buf := make([]byte, 4096)
		for {
			// n, err := io.ReadAtLeast(attachResp.Reader, buf, 1)
			n, err := attachResp.Reader.Read(buf)
			if err == io.EOF {
				return nil
			}
			if err != nil {
				return err
			}
			if n == 0 {
				panic("read 0 but no EOF")
			}
			if err := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				return err
			}
		}
	})
	// read from the socket and write to the container
	g.Go(func() error {
		defer attachResp.Close()
		for {
			_, bytes, err := conn.ReadMessage()
			if err != nil {
				return err
			}
			fmt.Printf("read %q\n", bytes)
			n := 0
			for n < len(bytes) {
				m, err := attachResp.Conn.Write(bytes)
				if err != nil {
					panic(err)
				}
				n += m
			}
		}
	})
	if err := g.Wait(); err != nil {
		panic(err)
	}
}

// reserveSpotContainer reserves a spot (a user) on a container. If no container
// has any user available, a new container is spawned.
//
// ref MAX_USERS_PER_CONTAINER
func (app *App) reserveSpotContainer(ctx context.Context, userID UserID) (ContainerID, error) {
	app.lock.Lock()
	var min ContainerID
	for k, v := range app.containers {
		if min == "" || v < app.containers[min] {
			min = k
		}
	}

	if min != "" && app.containers[min] < MAX_USERS_PER_CONTAINER {
		app.containers[min] += 1
		return min, nil
	}
	app.lock.Unlock()

	// create a new container
	createResp, err := app.client.ContainerCreate(ctx, &container.Config{
		Image:           "kirikou",
		NetworkDisabled: true,
	}, &container.HostConfig{
		ReadonlyRootfs: true,
	}, nil, nil, "")
	if err != nil {
		return "", err
	}

	app.lock.Lock()
	app.containers[ContainerID(createResp.ID)] = 1
	app.lock.Unlock()

	return ContainerID(createResp.ID), nil
}

func (app *App) releaseSpotContainer(containerID ContainerID) {
	app.lock.Lock()
	defer app.lock.Unlock()

	_, ok := app.containers[containerID]
	if !ok {
		panic("unknown container id")
	}
	app.containers[containerID] -= 1
}
