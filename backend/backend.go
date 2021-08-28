package main

import (
	"crypto/rand"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"

	"github.com/docker/docker/client"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type UserID string
type ContainerID string
type ExecID string

const MAX_USERS_PER_CONTAINER = 100

type App struct {
	client *client.Client

	lock  sync.Mutex            // protect users
	users map[string]*UserInfos // user ID -> container ID

	upgrader *websocket.Upgrader
}
type UserInfos struct {
	ContainerID string
	ShellExecID string
}

func NewApp() (*App, error) {
	client, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}

	return &App{
		client: client,
		users:  make(map[string]*UserInfos),
		upgrader: &websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// TODO: actually check if the origin is valid
				return true
			},
		},
	}, nil
}

func (app *App) Run() {

	cleanup := make(chan os.Signal)
	signal.Notify(cleanup, os.Interrupt)
	go func() {
		<-cleanup
		app.cleanup()
		os.Exit(1)
	}()

	http.HandleFunc("/attach", app.attach)
	http.HandleFunc("/resize", app.resize)
	http.HandleFunc("/repo-details", app.repoDetails)

	log.Println("Starting server on localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func main() {
	uuid.SetRand(rand.Reader)
	app, err := NewApp()
	if err != nil {
		panic(err)
	}
	app.Run()
}
