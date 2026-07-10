package middleware

import (
	"errors"
	"khairul169/garage-webui/utils"
	"net/http"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !IsAuthenticated(r) {
			utils.ResponseErrorStatus(w, errors.New("unauthorized"), http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func IsAuthenticated(r *http.Request) bool {
	if utils.GetEnv("AUTH_USER_PASS", "") == "" {
		return true
	}

	auth, ok := utils.Session.Get(r, "authenticated").(bool)
	return ok && auth
}
