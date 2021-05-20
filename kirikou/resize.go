package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"golang.org/x/sys/unix"
)

func main() {
	pid, err := strconv.ParseInt(os.Args[1], 10, 64)
	if err != nil {
		panic(err)
	}
	width, err := strconv.ParseInt(os.Args[2], 10, 16)
	if err != nil {
		panic(err)
	}
	height, err := strconv.ParseInt(os.Args[3], 10, 16)
	if err != nil {
		panic(err)
	}

	// i'm sure there's a better way but I can't find it... :(
	if _, err := os.ReadDir(fmt.Sprintf("/proc/%d/", pid)); err != nil {
		fmt.Println("cannot open process /proc")
		fmt.Println(err)
		return
	}

	link, err := os.Readlink(fmt.Sprintf("/proc/%d/fd/0", pid))
	if err != nil {
		fmt.Println("cannot open fd 0 (process probably isn't connected to tty)")
		fmt.Println(err)
		return
	}
	if !strings.HasPrefix(link, "/dev/pts/") {
		fmt.Println("unexpected prefix for /proc/<pid>/fd/0: ", link)
		return
	}

	fd, err := strconv.ParseInt(link[len("/dev/pts/"):], 10, 32)
	if err != nil {
		fmt.Println("invalid fd pts", link)
		fmt.Println(err)
		return
	}

	winsize := &unix.Winsize{
		Row: uint16(height),
		Col: uint16(width),
	}
	if err := unix.IoctlSetWinsize(int(fd), unix.TIOCSWINSZ, winsize); err != nil {
		fmt.Println("couldn't ioctl")
		fmt.Println(err)
		return
	}
}
