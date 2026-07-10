package utils

import (
	"khairul169/garage-webui/schema"
	"testing"
)

func TestGetS3WebEndpointUsesS3ServiceHost(t *testing.T) {
	t.Setenv("S3_WEB_ENDPOINT_URL", "")
	t.Setenv("S3_ENDPOINT_URL", "http://garage:3900")
	t.Setenv("API_BASE_URL", "http://garage-admin:3903")

	garage := &garage{Config: schema.Config{
		RPCPublicAddr: "__RPC_PUBLIC_ADDR__:3901",
		S3Web: schema.S3Web{
			BindAddr: "[::]:3902",
		},
	}}

	if endpoint := garage.GetS3WebEndpoint(); endpoint != "http://garage:3902" {
		t.Fatalf("expected S3 service host, got %q", endpoint)
	}
}

func TestGetS3WebEndpointPrefersExplicitEndpoint(t *testing.T) {
	t.Setenv("S3_WEB_ENDPOINT_URL", "http://garage-web.storage:8080")
	t.Setenv("S3_ENDPOINT_URL", "http://garage:3900")

	garage := &garage{}
	if endpoint := garage.GetS3WebEndpoint(); endpoint != "http://garage-web.storage:8080" {
		t.Fatalf("expected explicit web endpoint, got %q", endpoint)
	}
}
