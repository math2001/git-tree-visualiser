package main

import (
	"fmt"
	"sync"
)

type VLock struct {
	lock sync.Mutex
}

func (v *VLock) Lock() {
	fmt.Println("getting lock")
	v.lock.Lock()
	fmt.Println("got lock")
}

func (v *VLock) Unlock() {
	v.lock.Unlock()
	fmt.Println("unlocked")
}
