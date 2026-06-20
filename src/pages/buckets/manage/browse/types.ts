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

export type UploadProgressEvent = {
  percent: number;
  phase: "uploading" | "finishing";
};

export type UploadRowPhase = "uploading" | "finishing" | "paused";

export type UploadRowStatus =
  | "uploading"
  | "paused"
  | "finishing"
  | "error";

export type UploadRowItem = {
  id: string;
  bucket: string;
  prefix: string;
  key: string;
  fileName: string;
  size: number;
  percent: number;
  phase: UploadRowPhase;
  status: UploadRowStatus;
  errorMessage?: string;
};

export type PutObjectPayload = {
  key: string;
  file: File | null;
  onProgress?: (event: UploadProgressEvent) => void;
};
