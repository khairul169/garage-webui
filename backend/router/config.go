package router

import (
	"khairul169/garage-webui/utils"
	"net/http"
)

func GetConfig(w http.ResponseWriter, r *http.Request) {
	config := utils.Garage.Config
	utils.ResponseSuccess(w, config)
}
