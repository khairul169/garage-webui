//

export type GetBucketRes = Bucket[];

export type Bucket = {
  id: string;
  globalAliases: string[];
  localAliases: LocalAlias[];
  websiteAccess: boolean;
  websiteConfig: {
    indexDocument: string | null;
    errorDocument: string | null;
  };
  keys: Key[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
  quotas: Quotas;
};

export type UpdateBucket = {
  id: string;
  globalAliases: string[];
  localAliases: LocalAlias[];
  websiteAccess: {
    enabled: boolean;
    indexDocument: string | null;
    errorDocument: string | null;
  };
  keys: Key[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
  quotas: Quotas;
};

export type LocalAlias = {
  accessKeyId: string;
  alias: string;
};

export type Key = {
  accessKeyId: string;
  name: string;
  permissions: Permissions;
  bucketLocalAliases: string[];
};

export type Permissions = {
  read: boolean;
  write: boolean;
  owner: boolean;
};


export type Quotas = {
  maxSize: number | null;
  maxObjects: number | null;
};
