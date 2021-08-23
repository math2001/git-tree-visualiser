package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/rjeczalik/notify"
)

type RepoDetails struct {
	Commits  map[string]*Commit `json:"commits"`
	Roots    []string           `json:"roots"`
	Branches map[string]string  `json:"branches"`
	HEAD     string             `json:"HEAD"`
}

type Commit struct {
	Message  string   `json:"message"`
	Children []string `json:"children"`
	Parents  []string `json:"parents"`
}

func main() {
	enc := json.NewEncoder(os.Stdout)
	signal := make(chan notify.EventInfo, 1)

	if err := os.Chdir(os.Args[1]); err != nil {
		enc.Encode(map[string]string{
			"type":    "error",
			"details": fmt.Sprintf("chdir: %w", err),
		})
	}

	if err := notify.Watch("./...", signal, notify.All); err != nil {
		enc.Encode(map[string]string{
			"type":    "error",
			"details": fmt.Sprintf("notify.Watch: %s", err),
		})
	}

	stdin := make(chan struct{})
	go readFromStdin(stdin)
	for {
		select {
		case <-stdin:
			os.Exit(0)
		case <-signal:
			drainTillWindow(signal, 100*time.Millisecond)
			err := printRepoDetails(enc)
			if err != nil {
				enc.Encode(map[string]interface{}{
					"type":    "error",
					"details": err.Error(),
				})
			}
		}
	}

}

// close stdin channel as soon as we can read on stdin (or it is closed)
func readFromStdin(stdin chan<- struct{}) {
	buf := make([]byte, 2)
	os.Stdin.Read(buf)
	close(stdin)
}

// drains until we get <window> amount of time without a single event
// returns the number of drained events (for fun)
func drainTillWindow(signal <-chan notify.EventInfo, window time.Duration) int {
	n := 0
	timer := time.NewTimer(window)
	for {
		select {
		case <-signal:
			n++
			// drain everything that is available *right now* so that we reset
			// the timer as few times as possible
		loop:
			for {
				select {
				case <-signal:
					n++
				default:
					break loop
				}
			}

			// special move to reset the timer
			// see timer documentation.
			if !timer.Stop() {
				<-timer.C
			}
			timer.Reset(window)

		case <-timer.C:
			return n
		}
	}
}

func printRepoDetails(enc *json.Encoder) error {
	allHashes := make(map[string]struct{})
	// all hashes that are a child of another commit
	allChildren := make(map[string]struct{})

	commits := make(map[string]*Commit)

	// sparse: don't remove duplicate branches
	// output:
	//
	// commit1 child1 child2 child3 commit2
	// commit2 child2
	// ...
	//
	cmd := exec.Command("git", "rev-list", "--all", "--children", "--sparse")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	bufr := bufio.NewReader(stdout)
	for {
		line, err := bufr.ReadString('\n')
		if err == io.EOF {
			break
		} else if err != nil {
			return fmt.Errorf("read line from stdout: %w", err)
		}

		hashes := strings.Split(strings.TrimSpace(line), " ")
		hash := hashes[0]
		children := hashes[1:]

		message, err := getCommitMessage(hash)
		if err != nil {
			return fmt.Errorf("getCommitMessage: %w", err)
		}

		commits[hash] = &Commit{
			Message:  message,
			Children: children,
			Parents:  nil,
		}

		allHashes[hash] = struct{}{}
		for _, child := range children {
			allChildren[child] = struct{}{}
		}
	}
	if err := cmd.Wait(); err != nil {
		return err
	}

	branches, err := getBranches()

	// roots = allHashes (set minus) allChildren
	var roots []string
	for hash := range allHashes {
		if _, ok := allChildren[hash]; !ok {
			roots = append(roots, hash)
		}
	}

	inferUpwardsRelations(commits, roots)

	head, err := getHead()
	if err != nil {
		return fmt.Errorf("getHead: %w", err)
	}
	repoDetails := RepoDetails{
		Commits:  commits,
		Roots:    roots,
		Branches: branches,
		HEAD:     head,
	}

	return enc.Encode(repoDetails)
}

func getCommitMessage(hash string) (string, error) {
	cmd := exec.Command("git", "show", hash, "-s", "--format=%B")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(bytes.TrimSpace(bytes.Split(output, []byte("\n"))[0])), nil
}

func getBranches() (map[string]string, error) {
	cmd := exec.Command("git", "show-ref")
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	branches := make(map[string]string)
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		details := strings.SplitN(scanner.Text(), " ", 2)
		hash := details[0]
		ref := details[1]
		if strings.HasPrefix(ref, "refs/heads/") {
			branches[ref[len("refs/heads/"):]] = hash
		}
	}

	if err := cmd.Wait(); err != nil {
		return nil, err
	}

	return branches, nil
}

func getHead() (string, error) {
	cmd := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(bytes.TrimSpace(output)), nil
}

// build the repo upwards to (we have relations from parent to children,
// from that we infer the children to parent relations)
func inferUpwardsRelations(commits map[string]*Commit, roots []string) {
	var q []string
	q = append(q, roots...)
	for len(q) != 0 {
		hash := q[0]
		q = q[1:]
		for _, childHash := range commits[hash].Children {
			commits[childHash].Parents = append(commits[childHash].Parents, childHash)
			q = append(q, childHash)
		}
	}
}
