package router

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/coder/websocket"
)

type Terminal struct {
	ws         *websocket.Conn
	remoteAddr string
	cmd        *exec.Cmd
}

func (c *Terminal) NewSession(w http.ResponseWriter, r *http.Request) {
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Printf("Failed to get current working directory: %v\n", err)
	}

	cmd := &exec.Cmd{
		// Path: "/bin/bash",
		Path: "/usr/bin/fish",
		Dir:  cwd,
	}
	c.cmd = cmd

	stdin, err := cmd.StdinPipe()
	if err != nil {
		fmt.Printf("Failed to create stdin pipe: %v\n", err)
		return
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Printf("Failed to create stdout pipe: %v\n", err)
		return
	}
	cmd.Stderr = cmd.Stdout
	cmd.Stdout = os.Stdout

	if err := cmd.Start(); err != nil {
		fmt.Printf("Failed to start command: %v\n", err)
		return
	}

	go func() {
		// if err := cmd.Wait(); err != nil {
		// 	fmt.Printf("Shell exited with error: %v\n", err)
		// }
		// c.ws.CloseNow()
	}()

	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				return
			}

			fmt.Printf("Data from stdout: %s\n", string(buf[:n]))

			err = c.ws.Write(context.Background(), websocket.MessageText, buf[:n])
			if err != nil {
				fmt.Printf("Failed to write data to websocket: %v\n", err)
				return
			}

		}
	}()

	for {
		_, data, err := c.ws.Read(context.Background())
		if err != nil {
			return
		}

		fmt.Printf("Data from websocket: %s\n", string(data))

		if _, err := stdin.Write(data); err != nil {
			fmt.Printf("Failed to write data to stdin: %v\n", err)
			continue
		}
	}
}

func (c *Terminal) Close() {
	if c.cmd != nil {
		c.cmd.Process.Kill()
	}

	fmt.Println("Terminal session closed:", c.remoteAddr)
	c.ws.Close(websocket.StatusInternalError, "the connection is closed")
}

func TerminalHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("New terminal session: %s\n", r.RemoteAddr)

	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		fmt.Printf("Failed to accept websocket: %v\n", err)
		return
	}

	term := &Terminal{ws: c, remoteAddr: r.RemoteAddr}
	defer term.Close()

	term.NewSession(w, r)
}
