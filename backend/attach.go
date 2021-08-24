package main

import (
	"context"
	"errors"
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
	containerID, runnerNumber, err := app.reserveSpotContainer(ctx, userID)
	if err != nil {
		panic(err)
	}
	defer app.releaseSpotContainer(containerID)

	execResp, err := app.client.ContainerExecCreate(ctx, string(containerID), types.ExecConfig{
		User:         fmt.Sprintf("runner-%d", runnerNumber),
		WorkingDir:   fmt.Sprintf("/home/runner-%d/repo", runnerNumber),
		Tty:          true,
		AttachStdin:  true,
		AttachStderr: true,
		AttachStdout: true,
		Cmd:          []string{"bash", "--login"},
	})
	if err != nil {
		panic(err)
	}
	log.Printf("[container %s]: created bash process %s", containerID, execResp.ID)

	app.lock.Lock()
	app.users[userID] = &UserInfo{
		ShellExecID:  ExecID(execResp.ID),
		ContainerID:  containerID,
		RunnerNumber: runnerNumber,
	}
	app.lock.Unlock()

	// send the user id
	if err := conn.WriteMessage(websocket.TextMessage, []byte(userID)); err != nil {
		panic(err)
	}
	log.Printf("[container %s]: send userid on socket", containerID)

	attachResp, err := app.client.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	})
	if err != nil {
		panic(err)
	}
	defer attachResp.Close()
	log.Printf("[container %s]: attached bash process %s", containerID, execResp.ID)

	if err := app.client.ContainerExecStart(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	}); err != nil {
		panic(err)
	}
	log.Printf("[container %s]: started bash process %s", containerID, execResp.ID)

	var g errgroup.Group

	var errExpectedClose = errors.New("expected close")

	cleanlyClosingAttachResp := make(chan struct{})

	// read from the container, and write to the socket
	g.Go(func() error {
		defer conn.Close()
		buf := make([]byte, 4096)
		for {
			n, err := attachResp.Reader.Read(buf)
			if err == io.EOF {
				log.Printf("Container returned EOF\n")
				return nil
			}
			if err != nil {
				select {
				case <-cleanlyClosingAttachResp:
					return errExpectedClose
				default:
					return fmt.Errorf("container->socket reading: %w", err)
				}
			}
			if n == 0 {
				panic("read 0 but no EOF")
			}
			if err := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
					return fmt.Errorf("container->socket writing: %w", err)
				}
				return errExpectedClose
			}
			// fmt.Printf("Wrote %q to the web\n", buf[:n])
		}
	})
	// read from the socket and write to the container
	g.Go(func() error {
		defer func() {
			close(cleanlyClosingAttachResp)
			attachResp.Close()
		}()
		for {
			_, bytes, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
					return fmt.Errorf("socket->container: %w", err)
				}
				// otherwise, it's just a that the client left, so we need to clean up
				// the resources
				// conn.Close()
				return errExpectedClose
			}
			// fmt.Printf("read %q from web, ", bytes)
			n := 0
			for n < len(bytes) {
				m, err := attachResp.Conn.Write(bytes)
				if err != nil {
					panic(err)
				}
				n += m
			}
			// fmt.Printf("and wrote to the container\n")
		}
	})
	err = g.Wait()
	if err == errExpectedClose {
		log.Printf("[container %s]: cleanly closed", containerID)
	} else if err != nil {
		if closeErr, ok := err.(*websocket.CloseError); ok {
			panic(fmt.Sprintf("CloseError: (code=%d text=%q): %s", closeErr.Code, closeErr.Text, closeErr.Error()))
		}
		panic(fmt.Sprintf("not close error: %s\n", err))
	}
}

// reserveSpotContainer reserves a spot (a user) on a container. If no container
// has any user available, a new container is spawned.
//
// ref MAX_USERS_PER_CONTAINER
func (app *App) reserveSpotContainer(ctx context.Context, userID UserID) (ContainerID, int, error) {
	app.lock.Lock()

	// we try to minimize the number of containers we have
	// so we fill up the one with the most users on it, but with some room left.
	var max ContainerID
	for k, v := range app.containers {
		if max == "" || (v > app.containers[max] && v < MAX_USERS_PER_CONTAINER) {
			max = k
		}
	}

	if max != "" {
		runnerNumber := app.containers[max]
		app.containers[max] += 1
		app.lock.Unlock()
		return max, runnerNumber, nil
	}

	app.lock.Unlock()

	// create a new container
	createResp, err := app.client.ContainerCreate(ctx, &container.Config{
		Image:           "kirikou",
		Tty:             true,
		OpenStdin:       true,
		NetworkDisabled: true,
	}, &container.HostConfig{}, nil, nil, "")
	if err != nil {
		return "", 0, err
	}
	log.Printf("Created container %s", createResp.ID)

	err = app.client.ContainerStart(ctx, createResp.ID, types.ContainerStartOptions{})
	if err != nil {
		return "", 0, err
	}
	log.Printf("Started container %s", createResp.ID)

	app.lock.Lock()
	app.containers[ContainerID(createResp.ID)] = 1
	app.lock.Unlock()

	return ContainerID(createResp.ID), 0, nil
}

func (app *App) releaseSpotContainer(containerID ContainerID) {
	app.lock.Lock()
	defer app.lock.Unlock()

	// TODO: remove empty containers if there are some containers with some space left

	_, ok := app.containers[containerID]
	if !ok {
		panic("unknown container id")
	}
	app.containers[containerID] -= 1
}
