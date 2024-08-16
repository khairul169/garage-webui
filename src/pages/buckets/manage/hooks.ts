import api from "@/lib/api";
import { MutationOptions, useMutation, useQuery } from "@tanstack/react-query";
import { Bucket, Permissions } from "../types";

export const useBucket = (id?: string | null) => {
  return useQuery({
    queryKey: ["bucket", id],
    queryFn: () => api.get<Bucket>("/v1/bucket", { params: { id } }),
    enabled: !!id,
  });
};

export const useUpdateBucket = (id?: string | null) => {
  return useMutation({
    mutationFn: (values: any) => {
      return api.put<any>("/v1/bucket", { params: { id }, body: values });
    },
  });
};

export const useAllowKey = (
  bucketId?: string | null,
  options?: MutationOptions<
    any,
    Error,
    { keyId: string; permissions: Permissions }[]
  >
) => {
  return useMutation({
    mutationFn: async (payload) => {
      const promises = payload.map(async (key) => {
        console.log("test", key);
        return api.post("/v1/bucket/allow", {
          body: {
            bucketId,
            accessKeyId: key.keyId,
            permissions: key.permissions,
          },
        });
      });
      const result = await Promise.all(promises);
      return result;
    },
    ...options,
  });
};

export const useDenyKey = (
  bucketId?: string | null,
  options?: MutationOptions<
    any,
    Error,
    { keyId: string; permissions: Permissions }
  >
) => {
  return useMutation({
    mutationFn: (payload) => {
      return api.post("/v1/bucket/deny", {
        body: {
          bucketId,
          accessKeyId: payload.keyId,
          permissions: payload.permissions,
        },
      });
    },
    ...options,
  });
};

export const useRemoveBucket = (
  options?: MutationOptions<any, Error, string>
) => {
  return useMutation({
    mutationFn: (id) => api.delete("/v1/bucket", { params: { id } }),
    ...options,
  });
};
