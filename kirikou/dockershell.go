package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer cli.Close()

	http.HandleFunc("/attach", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			panic(err)
		}
		defer conn.Close()

		ctx := context.Background()
		createResp, err := cli.ContainerCreate(ctx, &container.Config{
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
		attachResp, err := cli.ContainerAttach(ctx, createResp.ID, types.ContainerAttachOptions{
			Stream: true,
			Stdout: true,
			Stdin:  true,
			Logs:   false,
		})
		if err != nil {
			panic(err)
		}
		if err := cli.ContainerStart(ctx, createResp.ID, types.ContainerStartOptions{}); err != nil {
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
					// if websocket.IsCloseError(err) {
					// 	if we
					// }
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
		log.Println("Exited properly")
	})
	fmt.Println("listening...")
	http.ListenAndServe("localhost:8081", nil)
}
