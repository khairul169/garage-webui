//go:build prod
// +build prod

package ui

import (
	"embed"
	"io/fs"
	"net/http"
	"path"
)

//go:embed dist
var embeddedFs embed.FS

func ServeUI() {
	distFs, _ := fs.Sub(embeddedFs, "dist")
	fileServer := http.FileServer(http.FS(distFs))

	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_path := path.Clean(r.URL.Path)[1:]

		// Rewrite non-existing paths to index.html
		if _, err := fs.Stat(distFs, _path); err != nil {
			index, _ := fs.ReadFile(distFs, "index.html")
			w.Header().Add("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write(index)
			return
		}

		fileServer.ServeHTTP(w, r)
	}))
}
