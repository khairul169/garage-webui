import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GetBucketRes } from "./types";

export const useBuckets = () => {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: () => api.get<GetBucketRes>("/buckets"),
  });
};
