package main

import (
	"fmt"
	"khairul169/garage-webui/router"
	"khairul169/garage-webui/ui"
	"khairul169/garage-webui/utils"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	// Initialize app
	godotenv.Load()
	utils.InitCacheManager()
	sessionMgr := utils.InitSessionManager()

	if err := utils.Garage.LoadConfig(); err != nil {
		log.Println("Cannot load garage config!", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/api/", http.StripPrefix("/api", router.HandleApiRouter()))
	ui.ServeUI(mux)

	host := utils.GetEnv("HOST", "0.0.0.0")
	port := utils.GetEnv("PORT", "3909")

	addr := fmt.Sprintf("%s:%s", host, port)
	log.Printf("Starting server on http://%s", addr)

	if err := http.ListenAndServe(addr, sessionMgr.LoadAndSave(mux)); err != nil {
		log.Fatal(err)
	}
}
