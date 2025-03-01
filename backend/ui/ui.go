//go:build !prod
// +build !prod

package ui

import "net/http"

func ServeUI(mux *http.ServeMux) {}
