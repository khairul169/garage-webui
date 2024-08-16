import api from "@/lib/api";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";
import { Key } from "./types";
import { CreateKeySchema } from "./schema";

export const useKeys = () => {
  return useQuery({
    queryKey: ["keys"],
    queryFn: () => api.get<Key[]>("/v1/key?list"),
  });
};

export const useCreateKey = (
  options?: UseMutationOptions<any, Error, CreateKeySchema>
) => {
  return useMutation({
    mutationFn: async (body) => {
      if (body.isImport) {
        return api.post("/v1/key/import", { body });
      }
      return api.post("/v1/key", { body });
    },
    ...options,
  });
};

export const useRemoveKey = (
  options?: UseMutationOptions<any, Error, string>
) => {
  return useMutation({
    mutationFn: (id) => api.delete("/v1/key", { params: { id } }),
    ...options,
  });
};
