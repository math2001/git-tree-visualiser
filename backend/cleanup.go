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
	for _, containerID := range app.users {
		err := app.client.ContainerKill(ctx, string(containerID), "KILL")
		if err != nil {
			log.Println("Killing container", containerID, err)
		}
		err = app.client.ContainerRemove(ctx, string(containerID), types.ContainerRemoveOptions{})
		if err != nil {
			log.Println("Removing container", containerID, err)
		}
	}
	log.Printf("Clean up %d containers", len(app.users))
	app.lock.Unlock()
}
