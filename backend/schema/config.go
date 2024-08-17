package schema

type Config struct {
	CompressionLevel             int64  `json:"compression_level" toml:"compression_level"`
	DataDir                      string `json:"data_dir" toml:"data_dir"`
	DBEngine                     string `json:"db_engine" toml:"db_engine"`
	MetadataAutoSnapshotInterval string `json:"metadata_auto_snapshot_interval" toml:"metadata_auto_snapshot_interval"`
	MetadataDir                  string `json:"metadata_dir" toml:"metadata_dir"`
	ReplicationFactor            int64  `json:"replication_factor" toml:"replication_factor"`
	RPCBindAddr                  string `json:"rpc_bind_addr" toml:"rpc_bind_addr"`
	RPCPublicAddr                string `json:"rpc_public_addr" toml:"rpc_public_addr"`
	RPCSecret                    string `json:"rpc_secret" toml:"rpc_secret"`
	Admin                        Admin  `json:"admin" toml:"admin"`
	S3API                        S3API  `json:"s3_api" toml:"s3_api"`
	S3Web                        S3Web  `json:"s3_web" toml:"s3_web"`
}

type Admin struct {
	AdminToken   string `json:"admin_token" toml:"admin_token"`
	APIBindAddr  string `json:"api_bind_addr" toml:"api_bind_addr"`
	MetricsToken string `json:"metrics_token" toml:"metrics_token"`
}

type S3API struct {
	APIBindAddr string `json:"api_bind_addr" toml:"api_bind_addr"`
	RootDomain  string `json:"root_domain" toml:"root_domain"`
	S3Region    string `json:"s3_region" toml:"s3_region"`
}

type S3Web struct {
	BindAddr   string `json:"bind_addr" toml:"bind_addr"`
	Index      string `json:"index" toml:"index"`
	RootDomain string `json:"root_domain" toml:"root_domain"`
}
