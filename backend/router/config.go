package router

import (
	"khairul169/garage-webui/utils"
	"net/http"
)

type Config struct{}

func (c *Config) GetAll(w http.ResponseWriter, r *http.Request) {
	config := utils.Garage.Config
	utils.ResponseSuccess(w, config)
}
