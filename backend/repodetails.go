package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func (app *App) repoDetails(w http.ResponseWriter, r *http.Request) {
	conn, err := app.upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	_, message, err := conn.ReadMessage()
	if err != nil {
		panic(err)
	}
	userID := UserID(message)
	app.ensureValidUserID(w, userID)
	app.makeUserNotifChannelIfNeeded(userID)

	for range app.users[userID].Channel {
		log.Println("send update")
	}
}

func (app *App) makeUserNotifChannelIfNeeded(userID UserID) {
	app.lock.Lock()
	defer app.lock.Unlock()
	if app.users[userID].Channel == nil {
		app.users[userID].Channel = make(chan struct{})
	}
}

func (app *App) ensureValidUserID(w http.ResponseWriter, userID UserID) {
	app.lock.Lock()
	defer app.lock.Unlock()
	infos, ok := app.users[userID]
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"details": "invalid user id"})
		return
	}
	if infos == nil {
		panic("user infos is nil")
	}
}
