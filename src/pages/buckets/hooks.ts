import api from "@/lib/api";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";
import { GetBucketRes } from "./types";
import { CreateBucketSchema } from "./schema";

export const useBuckets = () => {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: () => api.get<GetBucketRes>("/buckets"),
  });
};

export const useCreateBucket = (
  options?: UseMutationOptions<any, Error, CreateBucketSchema>
) => {
  return useMutation({
    mutationFn: (body) => api.post("/v2/CreateBucket", { body }),
    ...options,
  });
};
