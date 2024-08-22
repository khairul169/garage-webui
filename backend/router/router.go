package router

import (
	"net/http"
)

func HandleApiRouter() *http.ServeMux {
	router := http.NewServeMux()

	config := &Config{}
	router.HandleFunc("GET /config", config.GetAll)

	buckets := &Buckets{}
	router.HandleFunc("GET /buckets", buckets.GetAll)

	browse := &Browse{}
	router.HandleFunc("GET /browse/{bucket}", browse.GetObjects)
	router.HandleFunc("GET /browse/{bucket}/{key...}", browse.GetOneObject)
	router.HandleFunc("PUT /browse/{bucket}/{key...}", browse.PutObject)
	router.HandleFunc("DELETE /browse/{bucket}/{key...}", browse.DeleteObject)

	router.HandleFunc("/", ProxyHandler)

	return router
}

func HandleWebsocket() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("/terminal", TerminalHandler)

	return router
}
