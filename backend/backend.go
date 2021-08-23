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

type UserInfo struct {
	ShellExecID   ExecID
	WatcherExecID ExecID
	ContainerID   ContainerID
	RunnerNumber  int

	Channel chan struct{}
}

type App struct {
	client *client.Client

	// TODO: make one lock for each
	lock sync.Mutex // (protects containers and users)

	containers map[ContainerID]int // number of users on that container
	users      map[UserID]*UserInfo

	upgrader *websocket.Upgrader
}

func NewApp() (*App, error) {
	client, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}

	return &App{
		client:     client,
		users:      make(map[UserID]*UserInfo),
		containers: make(map[ContainerID]int),
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
	log.Fatal(http.ListenAndServe("localhost:8081", nil))
}

func main() {
	uuid.SetRand(rand.Reader)
	app, err := NewApp()
	if err != nil {
		panic(err)
	}
	app.Run()
}
