import api from "@/lib/api";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueries,
} from "@tanstack/react-query";
import { GetBucketRes, Bucket } from "./types";
import { CreateBucketSchema } from "./schema";

export const useBuckets = () => {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: () => api.get<GetBucketRes>("/v2/ListBuckets"),
  });
};

export const useBucketDetails = (id?: string | null) => {
  return useQuery({
    queryKey: ["bucket-details", id],
    queryFn: () => api.get<Bucket>("/v2/GetBucketInfo", { params: { id } }),
    enabled: !!id,
  });
};

export const useBucketsWithDetails = () => {
  const { data: buckets } = useBuckets();

  return useQueries({
    queries: (buckets || []).map((bucket) => ({
      queryKey: ["bucket-details", bucket.id],
      queryFn: () => api.get<Bucket>("/v2/GetBucketInfo", { params: { id: bucket.id } }),
      enabled: !!bucket.id,
    })),
  });
};

export const useCreateBucket = (
  options?: UseMutationOptions<unknown, Error, CreateBucketSchema>
) => {
  return useMutation({
    mutationFn: (body) => api.post("/v2/CreateBucket", { body }),
    ...options,
  });
};
