package main

import (
	"context"
	"log"

	"github.com/docker/docker/api/types"
)

func (app *App) cleanup() {
	app.lock.Lock()
	// for now, just kill every container, don't bother about closing sockets
	// properly
	ctx := context.Background()
	for _, userInfos := range app.users {
		err := app.client.ContainerKill(ctx, string(userInfos.ContainerID), "KILL")
		if err != nil {
			log.Println("Killing container", userInfos.ContainerID, err)
		}
		err = app.client.ContainerRemove(ctx, string(userInfos.ContainerID), types.ContainerRemoveOptions{})
		if err != nil {
			log.Println("Removing container", userInfos.ContainerID, err)
		}
	}
	log.Printf("Clean up %d containers", len(app.users))
	app.lock.Unlock()
}
