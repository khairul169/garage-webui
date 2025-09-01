import api from "@/lib/api";
import {
  MutationOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";
import { Bucket, Permissions } from "../types";

export const useBucket = (id?: string | null) => {
  return useQuery({
    queryKey: ["bucket", id],
    queryFn: () => api.get<Bucket>("/v2/GetBucketInfo", { params: { id } }),
    enabled: !!id,
  });
};

export const useUpdateBucket = (id?: string | null) => {
  return useMutation({
    mutationFn: (values: any) => {
      return api.post<any>("/v2/UpdateBucket", {
        params: { id },
        body: values,
      });
    },
  });
};

export const useAddAlias = (
  bucketId?: string | null,
  options?: UseMutationOptions<any, Error, string>
) => {
  return useMutation({
    mutationFn: (alias: string) => {
      return api.post("/v2/AddBucketAlias", {
        body: { bucketId, globalAlias: alias },
      });
    },
    ...options,
  });
};

export const useRemoveAlias = (
  bucketId?: string | null,
  options?: UseMutationOptions<any, Error, string>
) => {
  return useMutation({
    mutationFn: (alias: string) => {
      return api.post("/v2/RemoveBucketAlias", {
        body: { bucketId, globalAlias: alias },
      });
    },
    ...options,
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
        return api.post("/v2/AllowBucketKey", {
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
      return api.post("/v2/DenyBucketKey", {
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
    mutationFn: (id) => api.post("/v2/DeleteBucket", { params: { id } }),
    ...options,
  });
};
