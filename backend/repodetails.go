package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"reflect"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

const LOG_WATCHER = false

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
	userID := string(message)

	app.lock.Lock()
	userInfos, ok := app.users[userID]
	app.lock.Unlock()
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"details": "invalid user id"})
		return
	}

	attachResp, _, err := startWatcher(app.client, userInfos)
	if err != nil {
		panic(err)
	}
	log.Printf("[user %s]: started watcher", userID)

	var reader io.Reader
	if LOG_WATCHER {
		f, err := os.OpenFile("/tmp/log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			panic(err)
		}
		defer f.Close()
		fmt.Fprintf(f, "start new watcher")
		defer fmt.Fprintf(f, "closed a watcher")
		reader = io.TeeReader(attachResp.Conn, f)
	} else {
		reader = attachResp.Reader
	}

	// we can't just copy the output of attachResp.Conn (stream of bytes) to the
	// web socket (stream of messages) blindly, because the front end expects
	// each message to be the entire repository details object.
	decoder := json.NewDecoder(reader)

	var details interface{}
	var prevDetails interface{}
loop:
	for {
		// we don't care about what are the repository details, we just know it
		// has to be one object
		err := decoder.Decode(&details)
		if err == io.EOF {
			break loop
		} else if err != nil {
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

	log.Printf("[user %s]: stopped watcher", userID)
}

func startWatcher(client *client.Client, userInfos *UserInfos) (types.HijackedResponse, string, error) {

	var attachResp types.HijackedResponse
	ctx := context.Background()
	execResp, err := client.ContainerExecCreate(ctx, string(userInfos.ContainerID), types.ExecConfig{
		Tty:          true,
		User:         "runner",
		AttachStderr: true,
		AttachStdout: true,
		AttachStdin:  true,
		Cmd:          []string{"/watcher", "/home/runner/repo/", "500ms"},
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
