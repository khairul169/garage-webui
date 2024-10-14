package schema

import "time"

type BrowseObjectResult struct {
	Prefixes  []string        `json:"prefixes"`
	Objects   []BrowserObject `json:"objects"`
	Prefix    string          `json:"prefix"`
	NextToken *string         `json:"nextToken"`
}

type BrowserObject struct {
	ObjectKey    *string    `json:"objectKey"`
	LastModified *time.Time `json:"lastModified"`
	Size         *int64     `json:"size"`
	Url          string     `json:"url"`
}
