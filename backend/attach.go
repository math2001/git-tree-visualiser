package main

import (
	"bufio"
	"bytes"
	"context"
	"errors"
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

var errExpectedClose = errors.New("expected close")

func (app *App) attach(w http.ResponseWriter, r *http.Request) {
	userID := uuid.NewString()

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

	app.lock.Lock()
	app.users[userID] = containerID
	app.lock.Unlock()
	defer func() {
		app.lock.Lock()
		delete(app.users, userID)
		app.lock.Unlock()
	}()

	attachResp, err := createAndStartShell(ctx, app.client, containerID)
	if err != nil {
		panic(err)
	}
	defer attachResp.Close()

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
		Image:           "kirikou",
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

func createAndStartShell(ctx context.Context, client *client.Client, containerID string) (types.HijackedResponse, error) {
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
		return types.HijackedResponse{}, err
	}
	log.Printf("[container %s]: created shell", containerID)

	attachResp, err := client.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	})
	if err != nil {
		return types.HijackedResponse{}, err
	}
	log.Printf("[container %s]: attached shell", containerID)

	if err := client.ContainerExecStart(ctx, execResp.ID, types.ExecStartCheck{
		Tty: true,
	}); err != nil {
		return types.HijackedResponse{}, err
	}
	log.Printf("[container %s]: started shell", containerID)

	return attachResp, nil
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

// func (app *App) attachVerbose(w http.ResponseWriter, r *http.Request) {
// 	userID := UserID(uuid.NewString())
// 	log.Printf("attach for %q\n", userID)
//
// 	conn, err := app.upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer func() {
// 		conn.Close()
// 	}()
//
// 	ctx := context.Background()
// 	containerID, err := createAndStartContainer(ctx, userID)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer app.killAndRemoveContainer(containerID)
//
// 	// send the user id
// 	if err := conn.WriteMessage(websocket.TextMessage, []byte(userID)); err != nil {
// 		panic(err)
// 	}
// 	log.Printf("[container %s]: send userid on socket", containerID)
//
// 	execResp, err := app.client.ContainerExecCreate(ctx, string(containerID), types.ExecConfig{
// 		User:         "runner",
// 		WorkingDir:   "/home/runner/repo",
// 		Tty:          true,
// 		AttachStdin:  true,
// 		AttachStderr: true,
// 		AttachStdout: true,
// 		Cmd:          []string{"bash", "--login"},
// 	})
// 	if err != nil {
// 		panic(err)
// 	}
// 	log.Printf("[container %s]: created bash process %s", containerID, execResp.ID)
//
// 	app.lock.Lock()
// 	app.users[userID] = &UserInfo{
// 		ShellExecID: ExecID(execResp.ID),
// 		ContainerID: containerID,
// 	}
// 	app.lock.Unlock()
//
// 	attachResp, err := app.client.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{
// 		Tty: true,
// 	})
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer attachResp.Close()
// 	log.Printf("[container %s]: attached bash process %s", containerID, execResp.ID)

// 	if err := app.client.ContainerExecStart(ctx, execResp.ID, types.ExecStartCheck{
// 		Tty: true,
// 	}); err != nil {
// 		panic(err)
// 	}
// 	log.Printf("[container %s]: started bash process %s", containerID, execResp.ID)

// 	var g errgroup.Group

//	var errExpectedClose = errors.New("expected close")

// 	cleanlyClosingAttachResp := make(chan struct{})

// 	// read from the container, and write to the socket
// 	g.Go(func() error {
// 		defer conn.Close()
// 		buf := make([]byte, 4096)
// 		for {
// 			n, err := attachResp.Reader.Read(buf)
// 			if err == io.EOF {
// 				log.Printf("Container returned EOF\n")
// 				return nil
// 			}
// 			if err != nil {
// 				select {
// 				case <-cleanlyClosingAttachResp:
// 					return errExpectedClose
// 				default:
// 					return fmt.Errorf("container->socket reading: %w", err)
// 				}
// 			}
// 			if n == 0 {
// 				panic("read 0 but no EOF")
// 			}
// 			if err := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
// 				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
// 					return fmt.Errorf("container->socket writing: %w", err)
// 				}
// 				return errExpectedClose
// 			}
// 			// fmt.Printf("Wrote %q to the web\n", buf[:n])
// 		}
// 	})
// 	// read from the socket and write to the container
// 	g.Go(func() error {
// 		defer func() {
// 			close(cleanlyClosingAttachResp)
// 			attachResp.Close()
// 		}()
// 		for {
// 			_, bytes, err := conn.ReadMessage()
// 			if err != nil {
// 				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
// 					return fmt.Errorf("socket->container: %w", err)
// 				}
// 				// otherwise, it's just a that the client left, so we need to clean up
// 				// the resources
// 				// conn.Close()
// 				return errExpectedClose
// 			}
// 			// fmt.Printf("read %q from web, ", bytes)
// 			n := 0
// 			for n < len(bytes) {
// 				m, err := attachResp.Conn.Write(bytes)
// 				if err != nil {
// 					panic(err)
// 				}
// 				n += m
// 			}
// 			// fmt.Printf("and wrote to the container\n")
// 		}
// 	})
// 	err = g.Wait()
// 	if err == errExpectedClose {
// 		log.Printf("[container %s]: cleanly closed", containerID)
// 	} else if err != nil {
// 		if closeErr, ok := err.(*websocket.CloseError); ok {
// 			panic(fmt.Sprintf("CloseError: (code=%d text=%q): %s", closeErr.Code, closeErr.Text, closeErr.Error()))
// 		}
// 		panic(fmt.Sprintf("not close error: %s\n", err))
// 	}
// }

// func createAndStartContainer(ctx context.Context, userID UserID) (ContainerID, int, error) {

// 	// create a new container
// 	createResp, err := app.client.ContainerCreate(ctx, &container.Config{
// 		Image:           "kirikou",
// 		Tty:             true,
// 		OpenStdin:       true,
// 		NetworkDisabled: true,
// 	}, &container.HostConfig{}, nil, nil, "")
// 	if err != nil {
// 		return "", 0, err
// 	}
// 	log.Printf("Created container %s", createResp.ID)

// 	err = app.client.ContainerStart(ctx, createResp.ID, types.ContainerStartOptions{})
// 	if err != nil {
// 		return "", 0, err
// 	}
// 	log.Printf("Started container %s", createResp.ID)

// 	app.lock.Lock()
// 	app.users[userID] = 1
// 	app.lock.Unlock()

// 	return ContainerID(createResp.ID), 0, nil
// }

// func killAndRemoveContainer(containerID ContainerID) {
// 	app.lock.Lock()
// 	defer app.lock.Unlock()

// 	// TODO: remove empty containers if there are some containers with some space left

// 	_, ok := app.containers[containerID]
// 	if !ok {
// 		panic("unknown container id")
// 	}
// 	app.containers[containerID] -= 1
// }
