package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

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

		c2, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		fmt.Println("here")
		resch, errch := cli.ContainerWait(c2, createResp.ID, container.WaitConditionNotRunning)
		fmt.Println("here")
		select {
		case err := <-errch:
			fmt.Println(err)
		case res := <-resch:
			fmt.Println("THE CONTAINER PROBABLY EXITED!!")
			fmt.Println("result", res.Error, res.StatusCode)
		}
		fmt.Println("continue")
		done := make(chan struct{})

		// read from the container, and write to the socket
		go func() {
			defer func() {
				done <- struct{}{}
			}()
			buf := make([]byte, 4096)
			for {
				// n, err := io.ReadAtLeast(attachResp.Reader, buf, 1)
				n, err := attachResp.Reader.Read(buf)
				if err != nil && err != io.EOF {
					panic(err)
				}
				if err == io.EOF {
					return
				}
				if n == 0 {
					panic("read 0 but no EOF")
				}
				fmt.Println("read", buf[:n])
				if err := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
					panic(err)
				}
			}
		}()

		// read from the socket and write to the container
		go func() {
			defer func() {
				done <- struct{}{}
			}()
			for {
				messageType, bytes, err := conn.ReadMessage()
				if err != nil {
					panic(err)
				}
				fmt.Printf("message %q type (binary=%d text=%d): %d\n", bytes, websocket.BinaryMessage, websocket.TextMessage, messageType)
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

	})
	http.ListenAndServe("localhost:8081", nil)
}
