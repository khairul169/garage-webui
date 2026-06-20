import { APIError } from "@/lib/api";
import { UploadRowItem } from "./types";

export const getUploadStatusLabel = (item: UploadRowItem) => {
  if (item.status === "error") return item.errorMessage ?? "Upload failed";
  if (item.status === "paused") return `Paused at ${item.percent}%`;
  if (item.status === "finishing") return "Saving to storage…";
  return `Uploading — ${item.percent}%`;
};

export const toUploadErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "AbortError") return null;

  if (error instanceof APIError) {
    if (error.status === 0) return "Network error. Check your connection.";
    if (error.status === 413) return "File exceeds the server upload size limit.";
    if (error.status === 502 || error.status === 504) {
      return "Server timed out while saving. Retry or use the S3 API for large files.";
    }
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return "Upload failed.";
};
