package schema

type GetBucketsRes struct {
	ID            string       `json:"id"`
	GlobalAliases []string     `json:"globalAliases"`
	LocalAliases  []LocalAlias `json:"localAliases"`
	Created       string       `json:"created"`
}

type Bucket struct {
	ID                             string        `json:"id"`
	GlobalAliases                  []string      `json:"globalAliases"`
	LocalAliases                   []LocalAlias  `json:"localAliases"`
	WebsiteAccess                  bool          `json:"websiteAccess"`
	WebsiteConfig                  WebsiteConfig `json:"websiteConfig"`
	Keys                           []KeyElement  `json:"keys"`
	Objects                        int64         `json:"objects"`
	Bytes                          int64         `json:"bytes"`
	UnfinishedUploads              int64         `json:"unfinishedUploads"`
	UnfinishedMultipartUploads     int64         `json:"unfinishedMultipartUploads"`
	UnfinishedMultipartUploadParts int64         `json:"unfinishedMultipartUploadParts"`
	UnfinishedMultipartUploadBytes int64         `json:"unfinishedMultipartUploadBytes"`
	Quotas                         Quotas        `json:"quotas"`
	Created                        string        `json:"created"`
}

type LocalAlias struct {
	AccessKeyID string `json:"accessKeyId"`
	Alias       string `json:"alias"`
}

type KeyElement struct {
	AccessKeyID        string      `json:"accessKeyId"`
	Name               string      `json:"name"`
	Permissions        Permissions `json:"permissions"`
	BucketLocalAliases []string    `json:"bucketLocalAliases"`
	SecretAccessKey    string      `json:"secretAccessKey"`
}

type Permissions struct {
	Read  bool `json:"read"`
	Write bool `json:"write"`
	Owner bool `json:"owner"`
}

type Quotas struct {
	MaxSize    int64 `json:"maxSize"`
	MaxObjects int64 `json:"maxObjects"`
}

type WebsiteConfig struct {
	IndexDocument string `json:"indexDocument"`
	ErrorDocument string `json:"errorDocument"`
}
