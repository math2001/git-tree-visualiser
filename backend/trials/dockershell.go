package main

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strconv"
	"sync"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type App struct {
	client *client.Client

	// crypto-random uuid to docker container id
	users     map[string]string
	userslock sync.Mutex
}

func NewApp() (*App, error) {
	client, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}
	return &App{
		client: client,
		users:  make(map[string]string),
	}, nil
}

func (app *App) Close() error {
	return app.client.Close()
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (app *App) attach(w http.ResponseWriter, r *http.Request) {
	userID := uuid.NewString()
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer func() {
		conn.Close()

		app.userslock.Lock()
		delete(app.users, userID)
		app.userslock.Unlock()

		log.Println("exited properly")
	}()

	ctx := context.Background()
	createResp, err := app.client.ContainerCreate(ctx, &container.Config{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		OpenStdin:    true,
		Image:        "kirikou",
		Tty:          true,
	}, nil, nil, nil, "")
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := app.client.ContainerRemove(ctx, createResp.ID, types.ContainerRemoveOptions{
			Force: true, // kill the container if it's running
		}); err != nil {
			panic(err)
		}
	}()

	app.userslock.Lock()
	app.users[userID] = createResp.ID
	app.userslock.Unlock()

	// send the user id
	if err := conn.WriteMessage(websocket.TextMessage, []byte(userID)); err != nil {
		panic(err)
	}

	attachResp, err := app.client.ContainerAttach(ctx, createResp.ID, types.ContainerAttachOptions{
		Stream: true,
		Stdout: true,
		Stdin:  true,
		Logs:   false,
	})
	if err != nil {
		panic(err)
	}
	if err := app.client.ContainerStart(ctx, createResp.ID, types.ContainerStartOptions{}); err != nil {
		panic(err)
	}

	done := make(chan string)

	// read from the container, and write to the socket
	go func() {
		defer func() {
			conn.Close()
			done <- "read from container->socket"
		}()
		buf := make([]byte, 4096)
		for {
			// n, err := io.ReadAtLeast(attachResp.Reader, buf, 1)
			n, err := attachResp.Reader.Read(buf)
			if err == io.EOF || errors.Is(err, net.ErrClosed) {
				return
			}
			if err != nil && err != io.EOF {
				log.Printf("%#v", err)
				panic(err)
			}
			if n == 0 {
				panic("read 0 but no EOF")
			}
			if err := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				panic(err)
			}
		}
	}()

	// read from the socket and write to the container
	go func() {
		defer func() {
			if err := conn.Close(); err != nil {
				log.Println(err)
			}
			attachResp.Close()
			done <- "read from socket->container"
		}()
		for {
			_, bytes, err := conn.ReadMessage()
			if err != nil {
				if closeErr, ok := err.(*websocket.CloseError); ok {
					log.Println(closeErr)
					return
				}
				panic(err)
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
	}()

	<-done
	<-done
	close(done)
}

func (app *App) commit(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(500)
	fmt.Fprintf(w, "not implemented")
}

func (app *App) resize(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user-id")

	width, err := strconv.ParseUint(r.URL.Query().Get("width"), 10, 32)
	if err != nil {
		panic(err)
	}
	height, err := strconv.ParseUint(r.URL.Query().Get("height"), 10, 32)
	if err != nil {
		panic(err)
	}

	app.userslock.Lock()
	containerID, ok := app.users[userID]
	app.userslock.Unlock()

	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "invalid user id")
		log.Printf("invalid user id: %q", userID)
		return
	}

	if err := app.client.ContainerResize(context.Background(), containerID, types.ResizeOptions{
		Width:  uint(width),
		Height: uint(height),
	}); err != nil {
		panic(err)
	}
}

func main() {
	// crypto secure randomness
	// this is important because uuid are used to identify users (to match them
	// with their container)
	uuid.SetRand(rand.Reader)

	app, err := NewApp()
	if err != nil {
		panic(err)
	}
	defer app.Close()

	http.HandleFunc("/attach", app.attach)
	http.HandleFunc("/resize", app.resize)
	http.HandleFunc("/commit", app.commit)
	fmt.Println("listening...")
	http.ListenAndServe("localhost:8081", nil)
}
