package router

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"khairul169/garage-webui/schema"
	"khairul169/garage-webui/utils"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/smithy-go"
)

type Browse struct{}

func (b *Browse) GetObjects(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	bucket := r.PathValue("bucket")
	prefix := query.Get("prefix")
	continuationToken := query.Get("next")

	limit, err := strconv.Atoi(query.Get("limit"))
	if err != nil {
		limit = 100
	}

	client, err := getS3Client(bucket)
	if err != nil {
		utils.ResponseError(w, err)
		return
	}

	objects, err := client.ListObjectsV2(context.Background(), &s3.ListObjectsV2Input{
		Bucket:            aws.String(bucket),
		Prefix:            aws.String(prefix),
		Delimiter:         aws.String("/"),
		MaxKeys:           aws.Int32(int32(limit)),
		ContinuationToken: aws.String(continuationToken),
	})

	if err != nil {
		utils.ResponseError(w, err)
		return
	}

	result := schema.BrowseObjectResult{
		Prefixes:  []string{},
		Objects:   []schema.BrowserObject{},
		Prefix:    prefix,
		NextToken: objects.NextContinuationToken,
	}

	for _, prefix := range objects.CommonPrefixes {
		result.Prefixes = append(result.Prefixes, *prefix.Prefix)
	}

	for _, object := range objects.Contents {
		key := strings.TrimPrefix(*object.Key, prefix)
		if key == "" {
			continue
		}

		result.Objects = append(result.Objects, schema.BrowserObject{
			ObjectKey:    &key,
			LastModified: object.LastModified,
			Size:         object.Size,
		})
	}

	utils.ResponseSuccess(w, result)
}

func (b *Browse) GetOneObject(w http.ResponseWriter, r *http.Request) {
	bucket := r.PathValue("bucket")
	key := r.PathValue("key")
	view := r.URL.Query().Get("view") == "1"
	download := r.URL.Query().Get("dl") == "1"

	client, err := getS3Client(bucket)
	if err != nil {
		utils.ResponseError(w, err)
		return
	}

	object, err := client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		var ae smithy.APIError
		if errors.As(err, &ae) && ae.ErrorCode() == "NoSuchKey" {
			utils.ResponseErrorStatus(w, err, http.StatusNotFound)
			return
		}

		utils.ResponseError(w, err)
		return
	}

	if view || download {
		defer object.Body.Close()
		keys := strings.Split(key, "/")

		w.Header().Set("Content-Type", *object.ContentType)
		if download {
			w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", keys[len(keys)-1]))
		}

		w.WriteHeader(http.StatusOK)
		_, err = io.Copy(w, object.Body)

		if err != nil {
			utils.ResponseError(w, err)
			return
		}
		return
	}

	utils.ResponseSuccess(w, object)
}

func getBucketCredentials(bucket string) (aws.CredentialsProvider, error) {
	cacheKey := fmt.Sprintf("key:%s", bucket)
	cacheData := utils.Cache.Get(cacheKey)

	if cacheData != nil {
		return cacheData.(aws.CredentialsProvider), nil
	}

	body, err := utils.Garage.Fetch("/v1/bucket?globalAlias="+bucket, &utils.FetchOptions{})
	if err != nil {
		return nil, err
	}

	var bucketData schema.Bucket
	if err := json.Unmarshal(body, &bucketData); err != nil {
		return nil, err
	}

	var key schema.KeyElement

	for _, k := range bucketData.Keys {
		if !k.Permissions.Read || !k.Permissions.Write {
			continue
		}

		body, err := utils.Garage.Fetch(fmt.Sprintf("/v1/key?id=%s&showSecretKey=true", k.AccessKeyID), &utils.FetchOptions{})
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(body, &key); err != nil {
			return nil, err
		}
		break
	}

	credential := credentials.NewStaticCredentialsProvider(key.AccessKeyID, key.SecretAccessKey, "")
	utils.Cache.Set(cacheKey, credential, time.Hour)

	return credential, nil
}

func getS3Client(bucket string) (*s3.Client, error) {
	creds, err := getBucketCredentials(bucket)
	if err != nil {
		return nil, fmt.Errorf("cannot get credentials for bucket %s: %w", bucket, err)
	}

	awsConfig := aws.Config{
		Credentials:  creds,
		Region:       "garage",
		BaseEndpoint: aws.String(utils.Garage.GetS3Endpoint()),
	}

	client := s3.NewFromConfig(awsConfig, func(o *s3.Options) {
		o.UsePathStyle = true
		o.EndpointOptions.DisableHTTPS = true
	})

	return client, nil
}
