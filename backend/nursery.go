package main

import (
	"math/rand"
	"sync"
)

type Worker func() error

// Nursery hosts N goroutines, and waits until all goroutines have returned.
// The errors are returned in a shuffled list (shuffled because you cannot rely
// on order).
//
// It is not safe to use a nursery from multiple goroutines.
// Calling Go after having called wait will panic.
type Nursery struct {
	workers   Worker
	wg        sync.WaitGroup
	errs      chan error
	hasWaited bool
}

// Go starts a goroutine
func (n *Nursery) Go(w Worker) {

	if n.hasWaited {
		panic("Nursery has already waited")
	}

	if n.errs == nil {
		n.errs = make(chan error)
	}

	n.wg.Add(1)
	go func(w Worker) {
		result := w()
		n.wg.Done()
		n.errs <- result
	}(w)
}

// Wait waits for ALL the goroutine to exit, and returns a shuffled list of errors
func (n *Nursery) Wait() []error {
	n.hasWaited = true
	n.wg.Wait()

	var errs []error
loop:
	for {
		select {
		case err := <-n.errs:
			errs = append(errs, err)
		default:
			break loop
		}
	}

	rand.Shuffle(len(errs), func(i, j int) {
		tmp := errs[i]
		errs[i] = errs[j]
		errs[i] = tmp
	})

	return errs
}
