package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"khairul169/garage-webui/schema"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/pelletier/go-toml/v2"
)

type garage struct {
	Config schema.Config
}

var Garage = &garage{}

func (g *garage) LoadConfig() error {
	path := GetEnv("CONFIG_PATH", "/etc/garage.toml")
	data, err := os.ReadFile(path)

	if err != nil {
		return err
	}

	var cfg schema.Config
	err = toml.Unmarshal(data, &cfg)
	if err != nil {
		log.Fatal(err)
	}

	g.Config = cfg

	return nil
}

func (g *garage) GetAdminEndpoint() string {
	endpoint := os.Getenv("API_BASE_URL")
	if len(endpoint) > 0 {
		return endpoint
	}

	host := strings.Split(g.Config.RPCPublicAddr, ":")[0]
	port := LastString(strings.Split(g.Config.Admin.APIBindAddr, ":"))

	endpoint = fmt.Sprintf("%s:%s", host, port)
	if !strings.HasPrefix(endpoint, "http") {
		endpoint = fmt.Sprintf("http://%s", endpoint)
	}

	return endpoint
}

func (g *garage) GetS3Endpoint() string {
	endpoint := os.Getenv("S3_ENDPOINT_URL")
	if len(endpoint) > 0 {
		return endpoint
	}

	host := strings.Split(g.Config.RPCPublicAddr, ":")[0]
	port := LastString(strings.Split(g.Config.S3API.APIBindAddr, ":"))

	endpoint = fmt.Sprintf("%s:%s", host, port)
	if !strings.HasPrefix(endpoint, "http") {
		endpoint = fmt.Sprintf("http://%s", endpoint)
	}

	return endpoint
}

func (g *garage) GetAdminKey() string {
	key := os.Getenv("API_ADMIN_KEY")
	if len(key) > 0 {
		return key
	}
	return g.Config.Admin.AdminToken
}

type FetchOptions struct {
	Method  string
	Params  map[string]string
	Body    interface{}
	Headers map[string]string
}

func (g *garage) Fetch(url string, options *FetchOptions) ([]byte, error) {
	var reqBody io.Reader
	reqUrl := fmt.Sprintf("%s%s", g.GetAdminEndpoint(), url)
	method := http.MethodGet

	if len(options.Method) > 0 {
		method = options.Method
	}

	if options.Body != nil {
		body, err := json.Marshal(options.Body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(body)
	}

	req, err := http.NewRequest(method, reqUrl, reqBody)
	if err != nil {
		return nil, err
	}

	if options.Params != nil {
		q := req.URL.Query()
		for k, v := range options.Params {
			q.Add(k, v)
		}
		req.URL.RawQuery = q.Encode()
	}

	// Add auth token
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", g.GetAdminKey()))

	if options.Headers != nil {
		for k, v := range options.Headers {
			req.Header.Add(k, v)
		}
	}

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	if res.Body != nil {
		defer res.Body.Close()
	}

	if res.StatusCode != 200 {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}

		var data map[string]interface{}

		if err := json.Unmarshal(body, &data); err != nil {
			return nil, err
		}

		message := fmt.Sprintf("unexpected status code: %d", res.StatusCode)
		if data["message"] != nil {
			message = fmt.Sprintf("%v", data["message"])
		}

		return nil, fmt.Errorf(message)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
