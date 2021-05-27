package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"

	"golang.org/x/sync/errgroup"
)

func StartShell(name string, args []string, cwd string, conn net.Conn) error {
	// syscall.Chroot(cwd)
	cmd := exec.Command(name, args...)
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(conn, "Error occured: %s", err)
		return err
	}
	return nil
}

func main1() {
	var g errgroup.Group

	l, err := net.Listen("tcp", "127.0.0.1:8080")
	if err != nil {
		panic(err)
	}
	defer l.Close()

	for {
		conn, err := l.Accept()
		if err != nil {
			log.Println(err)
		}
		tempdir, err := os.MkdirTemp("", "shell-root.")
		if err != nil {
			log.Println(err)
		}
		g.Go(func() error {
			err := StartShell("bash", []string{}, tempdir, conn)
			fmt.Println("error", err)
			conn.Close()
			return err
		})
	}
	if err := g.Wait(); err != nil {
		panic(err)
	}
}
