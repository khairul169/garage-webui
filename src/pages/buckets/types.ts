//

export type GetBucketRes = Bucket[];

export type Bucket = {
  id: string;
  globalAliases: string[];
  websiteAccess: boolean;
  websiteConfig?: WebsiteConfig | null;
  keys: Key[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
  quotas: Quotas;
};

export type Key = {
  accessKeyId: string;
  name: string;
  permissions: Permissions;
  bucketLocalAliases: any[];
};

export type Permissions = {
  read: boolean;
  write: boolean;
  owner: boolean;
};

export type WebsiteConfig = {
  indexDocument: string;
  errorDocument: string;
};

export type Quotas = {
  maxSize: null;
  maxObjects: null;
};
