package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

func (app *App) repoDetails(w http.ResponseWriter, r *http.Request) {
	// this function returns as soon as the web socket is closed

	wsconn, err := app.upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer wsconn.Close()

	_, message, err := wsconn.ReadMessage()
	if err != nil {
		panic(err)
	}
	userID := UserID(message)

	app.lock.Lock()
	userInfos, ok := app.users[userID]
	app.lock.Unlock()

	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"details": "invalid user id"})
		return
	}

	attachResp, execID, err := startWatcher(app.client, userInfos)
	if err != nil {
		panic(err)
	}
	log.Printf("[user %s]: started watcher", userID)

	app.lock.Lock()
	app.users[userID].WatcherExecID = ExecID(execID)
	app.lock.Unlock()

	// we can't just copy the output of attachResp.Conn (stream of bytes) to the
	// web socket (stream of messages) blindly, because the front end expects
	// each message to be the entire repository details object.
	decoder := json.NewDecoder(attachResp.Conn)

	var details interface{}
	var prevDetails interface{}
loop:
	for {
		// we don't care about what are the repository details, we just know it
		// has to be one object
		if err := decoder.Decode(&details); err != nil {
			panic(err)
		}

		// don't send if there haven't been any change we care about
		if reflect.DeepEqual(details, prevDetails) {
			continue
		}
		prevDetails = details

		if err := wsconn.WriteJSON(details); err != nil {
			if !websocket.IsCloseError(err, websocket.CloseGoingAway) {
				panic(err)
			}
			break loop
		}
	}

	// stop the watcher (this closes the stdin, which the watcher detects)
	attachResp.Close()

	app.lock.Lock()
	app.users[userID].WatcherExecID = ""
	app.lock.Unlock()

	log.Printf("[user %s]: stopped watcher", userID)
}

func startWatcher(client *client.Client, userInfos *UserInfo) (types.HijackedResponse, string, error) {

	var attachResp types.HijackedResponse
	ctx := context.Background()
	execResp, err := client.ContainerExecCreate(ctx, string(userInfos.ContainerID), types.ExecConfig{
		Tty:          true,
		User:         fmt.Sprintf("runner-%d", userInfos.RunnerNumber),
		AttachStderr: true,
		AttachStdout: true,
		AttachStdin:  true,
		Cmd:          []string{"/watcher", fmt.Sprintf("/home/runner-%d/repo/", userInfos.RunnerNumber), "500ms"},
	})
	if err != nil {
		return attachResp, "", err
	}

	execID := execResp.ID

	attachResp, err = client.ContainerExecAttach(ctx, execID, types.ExecStartCheck{Tty: true})
	if err != nil {
		return attachResp, "", err
	}

	err = client.ContainerExecStart(ctx, execID, types.ExecStartCheck{Tty: true})
	if err != nil {
		return attachResp, "", err
	}

	return attachResp, execID, nil
}

func (app *App) makeUserNotifChannelIfNeeded(userID UserID) {
	app.lock.Lock()
	defer app.lock.Unlock()
	if app.users[userID].Channel == nil {
		app.users[userID].Channel = make(chan struct{})
	}
}
