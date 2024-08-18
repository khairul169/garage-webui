package router

import "net/http"

func HandleApiRouter() *http.ServeMux {
	router := http.NewServeMux()

	config := &Config{}
	router.HandleFunc("GET /config", config.GetAll)

	buckets := &Buckets{}
	router.HandleFunc("GET /buckets", buckets.GetAll)

	browse := &Browse{}
	router.HandleFunc("GET /browse/{bucket}", browse.GetObjects)
	router.HandleFunc("GET /browse/{bucket}/{key...}", browse.GetOneObject)

	router.HandleFunc("/", ProxyHandler)

	return router
}
