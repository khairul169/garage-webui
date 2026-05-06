import api from "@/lib/api";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";
import { Bucket } from "../../types";
import {
  GetObjectsResult,
  PutObjectPayload,
  UseBrowserObjectOptions,
} from "./types";

export const useBrowseObjects = (
  bucket: Bucket,
  options?: UseBrowserObjectOptions
) => {
  return useQuery({
    queryKey: ["browse", bucket.id, options],
    queryFn: () =>
      api.get<GetObjectsResult>(`/browse/${bucket.id}`, { params: options }),
  });
};

export const usePutObject = (
  bucket: Bucket,
  options?: UseMutationOptions<any, Error, PutObjectPayload>
) => {
  return useMutation({
    mutationFn: async (body) => {
      const formData = new FormData();
      if (body.file) {
        formData.append("file", body.file);
      }

      return api.put(`/browse/${bucket.id}/${body.key}`, { body: formData });
    },
    ...options,
  });
};

export const useDeleteObject = (
  bucket: Bucket,
  options?: UseMutationOptions<any, Error, { key: string; recursive?: boolean }>
) => {
  return useMutation({
    mutationFn: (data) =>
      api.delete(`/browse/${bucket.id}/${data.key}`, {
        params: { recursive: data.recursive },
      }),
    ...options,
  });
};
