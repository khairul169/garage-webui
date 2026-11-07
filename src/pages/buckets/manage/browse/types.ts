export type UseBrowserObjectOptions = Partial<{
  prefix: string;
  limit: number;
  next: string;
}>;

export type GetObjectsResult = {
  prefixes: string[];
  objects: Object[];
  prefix: string;
  nextToken: string | null;
};

export type Object = {
  objectKey: string;
  lastModified: Date;
  size: number;
  url: string;
};

export type PutObjectPayload = {
  key: string;
  file: File | null;
};

export type DeleteObjectsError = {
  key?: string;
  code?: string;
  message?: string;
};

export type DeleteObjectsResult = {
  deleted: number;
  errors?: DeleteObjectsError[];
};

export type DeleteObjectResult = DeleteObjectsResult | Record<string, unknown>;
