import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bucket } from "../types";

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
