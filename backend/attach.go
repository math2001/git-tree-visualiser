package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func (app *App) attach(w http.ResponseWriter, r *http.Request) {
	userID := uuid.NewString()
	log.Printf("new /attach for %s", userID)

	wsconn, err := app.upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer wsconn.Close()

	ctx := context.TODO()
	containerID, err := createAndStartContainer(ctx, app.client)
	if err != nil {
		panic(err)
	}
	defer killAndRemoveContainer(ctx, app.client, containerID)

	attachResp, shellExecID, err := createAndStartShell(ctx, app.client, containerID)
	if err != nil {
		panic(err)
	}
	defer attachResp.Close()

	app.lock.Lock()
	app.users[userID] = &UserInfos{
		ContainerID: containerID,
		ShellExecID: shellExecID,
	}
	app.lock.Unlock()

	defer func() {
		app.lock.Lock()
		delete(app.users, userID)
		app.lock.Unlock()
	}()

	// send the user id
	if err := wsconn.WriteMessage(websocket.TextMessage, []byte(userID)); err != nil {
		panic(err)
	}
	log.Printf("[container %s]: send userid on socket", containerID)

	if err := bidirectionalCopy(ctx, attachResp, wsconn); err != nil {
		panic(err)
	}
	log.Printf("[container %s]: bidirectional copy done", containerID)

}

func createAndStartContainer(ctx context.Context, client *client.Client) (string, error) {
	createResp, err := client.ContainerCreate(ctx, &container.Config{
		Image:           "math2001/kirikou",
		Tty:             true,
		OpenStdin:       true,
		NetworkDisabled: true,
	}, &container.HostConfig{}, nil, nil, "")
	if err != nil {
		return "", err
	}
	log.Printf("[container %s]: created", createResp.ID)

	err = client.ContainerStart(ctx, createResp.ID, types.ContainerStartOptions{})
	if err != nil {
		return "", err
	}
	log.Printf("[container %s]: started", createResp.ID)

	return createResp.ID, nil
}

func killAndRemoveContainer(ctx context.Context, client *client.Client, containerID string) error {
	err := client.ContainerKill(ctx, containerID, "SIGKILL")
	if err != nil {
		return err
	}
	log.Printf("[container %s]: killed", containerID)
	err = client.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{
		Force: true,
	})
	if err != nil {
		return err
	}
	log.Printf("[container %s]: removed", containerID)
	return nil
}

func createAndStartShell(ctx context.Context, client *client.Client, containerID string) (types.HijackedResponse, string, error) {
	execResp, err := client.ContainerExecCreate(ctx, string(containerID), types.ExecConfig{
		User:         "runner",
		WorkingDir:   "/home/runner/repo",
		Tty:          true,
		AttachStdin:  true,
		AttachStderr: true,
		AttachStdout: true,
		Cmd:          []string{"bash", "--login"},
	})
	if err != nil {
		return types.HijackedResponse{}, "", err
	}
	log.Printf("[container %s]: created shell", containerID)

	attachResp, err := client.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	})
	if err != nil {
		return types.HijackedResponse{}, "", err
	}
	log.Printf("[container %s]: attached shell", containerID)

	if err := client.ContainerExecStart(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	}); err != nil {
		return types.HijackedResponse{}, "", err
	}
	log.Printf("[container %s]: started shell", containerID)

	return attachResp, execResp.ID, nil
}

func bidirectionalCopy(ctx context.Context, attachResp types.HijackedResponse, wsconn *websocket.Conn) error {
	var nur Nursery

	nur.Go(func() error {
		return wsToContainer(ctx, attachResp, wsconn)
	})

	nur.Go(func() error {
		return containerToWs(ctx, attachResp, wsconn)
	})

	errs := nur.Wait()
	for _, err := range errs {
		// if one of the errors was Going Away, we *want* to terminate the
		// container so we discard other errors (they were probably caused by us
		// by closing the container)
		if websocket.IsCloseError(err, websocket.CloseGoingAway) {
			return nil
		}
	}

	var buf bytes.Buffer
	for _, err := range errs {
		if err != nil {
			fmt.Fprintf(&buf, "- %s\n", err)
		}
	}
	return fmt.Errorf("Errors:\n%s", buf)
}

func wsToContainer(ctx context.Context, attachResp types.HijackedResponse, wsconn *websocket.Conn) error {
	defer attachResp.Close()
	defer wsconn.Close()

	bufw := bufio.NewWriter(attachResp.Conn)
	for {
		_, p, err := wsconn.ReadMessage()
		if err != nil {
			return err
		}
		// TODO: handle ctrl-d
		if _, err := bufw.Write(p); err != nil {
			return err
		}
		if err := bufw.Flush(); err != nil {
			return err
		}
	}
}

func containerToWs(ctx context.Context, attachResp types.HijackedResponse, wsconn *websocket.Conn) error {
	defer attachResp.Close()
	defer wsconn.Close()

	buf := make([]byte, 4096)
	for {
		n, err := attachResp.Reader.Read(buf)
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		if err := wsconn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
			return err
		}
	}
}
