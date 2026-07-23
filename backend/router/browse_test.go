package router

import (
	"io"
	"khairul169/garage-webui/utils"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAnonymousObjectUsesGarageWebEndpoint(t *testing.T) {
	webEndpoint := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != "public-bucket" {
			t.Errorf("expected bucket host, got %q", r.Host)
		}
		if r.URL.Path != "/folder/file name.txt" {
			t.Errorf("expected object path, got %q", r.URL.Path)
		}
		if r.URL.RawQuery != "" {
			t.Errorf("expected UI query parameters to be removed, got %q", r.URL.RawQuery)
		}
		if r.Header.Get("Authorization") != "" {
			t.Error("authorization header was forwarded to the public endpoint")
		}
		if r.Header.Get("Cookie") != "" {
			t.Error("cookie header was forwarded to the public endpoint")
		}

		w.Header().Set("Content-Type", "text/plain")
		_, _ = io.WriteString(w, "public content")
	}))
	defer webEndpoint.Close()

	t.Setenv("AUTH_USER_PASS", "user:hash")
	t.Setenv("S3_WEB_ENDPOINT_URL", webEndpoint.URL)
	sessionManager := utils.InitSessionManager()
	handler := sessionManager.LoadAndSave(HandleApiRouter())

	request := httptest.NewRequest(http.MethodGet, "/browse/public-bucket/folder/file%20name.txt?view=1", nil)
	request.Header.Set("Authorization", "Bearer private-token")
	request.Header.Set("Cookie", "dashboard=private-session")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", response.Code, response.Body.String())
	}
	if response.Body.String() != "public content" {
		t.Errorf("expected proxied object body, got %q", response.Body.String())
	}
}

func TestAnonymousBucketListingStillRequiresAuthentication(t *testing.T) {
	t.Setenv("AUTH_USER_PASS", "user:hash")
	sessionManager := utils.InitSessionManager()
	handler := sessionManager.LoadAndSave(HandleApiRouter())

	request := httptest.NewRequest(http.MethodGet, "/browse/private-bucket", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d: %s", response.Code, response.Body.String())
	}
}
