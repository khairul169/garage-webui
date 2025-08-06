import api from "@/lib/api";
import {
  ApplyLayoutResult,
  AssignNodeBody,
  GetClusterLayoutResult,
  GetStatusResult,
} from "./types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";

export const useClusterStatus = () => {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => api.get<GetStatusResult>("/v2/GetClusterStatus"),
  });
};

export const useClusterLayout = () => {
  return useQuery({
    queryKey: ["layout"],
    queryFn: () => api.get<GetClusterLayoutResult>("/v1/layout"),
  });
};

export const useConnectNode = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, string>({
    mutationFn: async (nodeId) => {
      const [res] = await api.post("/v1/connect", { body: [nodeId] });
      if (!res.success) {
        throw new Error(res.error || "Unknown error");
      }
      return res;
    },
    ...(options as any),
  });
};

export const useAssignNode = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, AssignNodeBody>({
    mutationFn: (data) => api.post("/v1/layout", { body: [data] }),
    ...(options as any),
  });
};

export const useUnassignNode = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, string>({
    mutationFn: (nodeId) =>
      api.post("/v1/layout", { body: [{ id: nodeId, remove: true }] }),
    ...(options as any),
  });
};

export const useRevertChanges = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, number>({
    mutationFn: (version) =>
      api.post("/v1/layout/revert", { body: { version } }),
    ...(options as any),
  });
};

export const useApplyChanges = (options?: Partial<UseMutationOptions>) => {
  return useMutation<ApplyLayoutResult, Error, number>({
    mutationFn: (version) =>
      api.post("/v1/layout/apply", { body: { version } }),
    ...(options as any),
  });
};
