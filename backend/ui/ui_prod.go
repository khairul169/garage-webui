//go:build prod
// +build prod

package ui

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"
)

//go:embed dist
var embeddedFs embed.FS

func ServeUI(mux *http.ServeMux) {
	distFs, _ := fs.Sub(embeddedFs, "dist")
	fileServer := http.FileServer(http.FS(distFs))
	basePath := os.Getenv("BASE_PATH")

	mux.Handle(basePath+"/", http.StripPrefix(basePath, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_path := path.Clean(r.URL.Path)[1:]

		// Rewrite non-existing paths to index.html
		if _, err := fs.Stat(distFs, _path); err != nil {
			index, _ := fs.ReadFile(distFs, "index.html")
			html := string(index)

			// Set base path for the UI
			html = strings.ReplaceAll(html, "%BASE_PATH%", basePath)
			html = addBasePath(html, basePath)

			w.Header().Add("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(html))
			return
		}

		// Add prefix to each /assets strings in js
		if len(basePath) > 0 && strings.HasSuffix(_path, ".js") {
			data, _ := fs.ReadFile(distFs, _path)
			html := string(data)
			html = strings.ReplaceAll(html, "assets/", basePath[1:]+"/assets/")

			w.Header().Add("Content-Type", "text/javascript")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(html))
			return
		}

		fileServer.ServeHTTP(w, r)
	})))
}

func addBasePath(html string, basePath string) string {
	re := regexp.MustCompile(`(href|src)=["'](/[^"'>]+)["']`)
	return re.ReplaceAllStringFunc(html, func(match string) string {
		return re.ReplaceAllString(match, `$1="`+basePath+`$2"`)
	})
}
