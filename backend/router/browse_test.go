package router

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"sync"
	"testing"
	"time"

	"khairul169/garage-webui/schema"
	"khairul169/garage-webui/utils"

	"github.com/aws/aws-sdk-go-v2/credentials"
)

type fakeS3 struct {
	mu          sync.Mutex
	keys        []string
	deletedKeys []string
	failedKeys  map[string]bool
	listCalls   int
	deleteCalls int
}

type listBucketResult struct {
	XMLName               xml.Name       `xml:"ListBucketResult"`
	Name                  string         `xml:"Name"`
	Prefix                string         `xml:"Prefix"`
	KeyCount              int            `xml:"KeyCount"`
	MaxKeys               int            `xml:"MaxKeys"`
	IsTruncated           bool           `xml:"IsTruncated"`
	NextContinuationToken string         `xml:"NextContinuationToken,omitempty"`
	Contents              []listContents `xml:"Contents"`
}

type listContents struct {
	Key          string `xml:"Key"`
	LastModified string `xml:"LastModified"`
	ETag         string `xml:"ETag"`
	Size         int64  `xml:"Size"`
	StorageClass string `xml:"StorageClass"`
}

type deleteRequest struct {
	Objects []deleteObject `xml:"Object"`
}

type deleteObject struct {
	Key string `xml:"Key"`
}

type deleteResult struct {
	XMLName xml.Name          `xml:"DeleteResult"`
	Deleted []deletedObject   `xml:"Deleted"`
	Errors  []deleteErrorItem `xml:"Error"`
}

type deletedObject struct {
	Key string `xml:"Key"`
}

type deleteErrorItem struct {
	Key     string `xml:"Key"`
	Code    string `xml:"Code"`
	Message string `xml:"Message"`
}

func (f *fakeS3) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet && r.URL.Query().Get("list-type") == "2":
		f.handleList(w, r)
	case r.Method == http.MethodPost && r.URL.Query().Has("delete"):
		f.handleDelete(w, r)
	default:
		http.Error(w, "unexpected request", http.StatusBadRequest)
	}
}

func (f *fakeS3) handleList(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.listCalls++

	const pageSize = 1000
	start := 0
	if token := r.URL.Query().Get("continuation-token"); token != "" {
		parsed, err := strconv.Atoi(token)
		if err != nil {
			http.Error(w, "invalid continuation token", http.StatusBadRequest)
			return
		}
		start = parsed
	}

	end := start + pageSize
	if end > len(f.keys) {
		end = len(f.keys)
	}
	if start > len(f.keys) {
		start = len(f.keys)
	}

	result := listBucketResult{
		Name:        "test-bucket",
		Prefix:      r.URL.Query().Get("prefix"),
		KeyCount:    end - start,
		MaxKeys:     pageSize,
		IsTruncated: end < len(f.keys),
	}
	if result.IsTruncated {
		result.NextContinuationToken = strconv.Itoa(end)
	}

	for _, key := range f.keys[start:end] {
		result.Contents = append(result.Contents, listContents{
			Key:          key,
			LastModified: time.Now().UTC().Format(time.RFC3339),
			ETag:         `"etag"`,
			Size:         0,
			StorageClass: "STANDARD",
		})
	}

	w.Header().Set("Content-Type", "application/xml")
	xml.NewEncoder(w).Encode(result)
}

func (f *fakeS3) handleDelete(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.deleteCalls++

	var req deleteRequest
	if err := xml.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid delete request", http.StatusBadRequest)
		return
	}

	var result deleteResult
	for _, object := range req.Objects {
		if f.failedKeys[object.Key] {
			result.Errors = append(result.Errors, deleteErrorItem{
				Key:     object.Key,
				Code:    "AccessDenied",
				Message: "access denied",
			})
			continue
		}

		f.deletedKeys = append(f.deletedKeys, object.Key)
		result.Deleted = append(result.Deleted, deletedObject{Key: object.Key})
	}

	w.Header().Set("Content-Type", "application/xml")
	xml.NewEncoder(w).Encode(result)
}

func newFakeS3Server(t *testing.T, fake *fakeS3) *httptest.Server {
	t.Helper()

	server := httptest.NewServer(fake)
	t.Cleanup(server.Close)

	t.Setenv("S3_ENDPOINT_URL", server.URL)
	t.Setenv("S3_REGION", "garage")

	utils.InitCacheManager()
	utils.Cache.Set("key:test-bucket", credentials.NewStaticCredentialsProvider(
		"test-access-key",
		"test-secret-key",
		"",
	), time.Hour)

	return server
}

func testBrowseMux() *http.ServeMux {
	mux := http.NewServeMux()
	browse := &Browse{}
	mux.HandleFunc("DELETE /browse/{bucket}/{key...}", browse.DeleteObject)
	return mux
}

func TestDeleteObjectRecursiveDeletesAllPages(t *testing.T) {
	keys := make([]string, 1001)
	for i := range keys {
		keys[i] = fmt.Sprintf("dir/object-%04d", i)
	}

	fake := &fakeS3{keys: keys}
	newFakeS3Server(t, fake)

	req := httptest.NewRequest(http.MethodDelete, "/browse/test-bucket/dir/?recursive=true", nil)
	rec := httptest.NewRecorder()
	testBrowseMux().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var result schema.DeleteObjectsResult
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatalf("cannot decode response: %v", err)
	}

	if result.Deleted != 1001 {
		t.Errorf("expected 1001 deleted objects, got %d", result.Deleted)
	}
	if len(result.Errors) != 0 {
		t.Errorf("expected no errors, got %v", result.Errors)
	}
	if fake.listCalls != 2 {
		t.Errorf("expected 2 list calls, got %d", fake.listCalls)
	}
	if fake.deleteCalls != 2 {
		t.Errorf("expected 2 delete calls, got %d", fake.deleteCalls)
	}
	if len(fake.deletedKeys) != 1001 {
		t.Errorf("expected 1001 keys sent to S3 delete, got %d", len(fake.deletedKeys))
	}
}

func TestDeleteObjectRecursiveReportsPartialFailures(t *testing.T) {
	fake := &fakeS3{
		keys:       []string{"dir/a", "dir/b", "dir/c"},
		failedKeys: map[string]bool{"dir/b": true},
	}
	newFakeS3Server(t, fake)

	req := httptest.NewRequest(http.MethodDelete, "/browse/test-bucket/dir/?recursive=true", nil)
	rec := httptest.NewRecorder()
	testBrowseMux().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var result schema.DeleteObjectsResult
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatalf("cannot decode response: %v", err)
	}

	if result.Deleted != 2 {
		t.Errorf("expected 2 deleted objects, got %d", result.Deleted)
	}
	if len(result.Errors) != 1 {
		t.Fatalf("expected 1 error, got %v", result.Errors)
	}
	if result.Errors[0].Key != "dir/b" {
		t.Errorf("expected the failing key to be dir/b, got %q", result.Errors[0].Key)
	}
	if result.Errors[0].Code != "AccessDenied" {
		t.Errorf("expected AccessDenied, got %q", result.Errors[0].Code)
	}
}
