import api from "@/lib/api";
import {
  ApplyLayoutResult,
  AssignNodeBody,
  GetClusterLayoutResult,
  GetNodeInfoResult,
  GetStatusResult,
} from "./types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";

export const useNodeInfo = () => {
  return useQuery({
    queryKey: ["node-info"],
    queryFn: () =>
      api.get<GetNodeInfoResult>("/v2/GetNodeInfo", {
        params: { node: "self" },
      }),
    select: (data) => Object.values(data?.success || {})?.[0],
  });
};

export const useClusterStatus = () => {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => api.get<GetStatusResult>("/v2/GetClusterStatus"),
  });
};

export const useClusterLayout = () => {
  return useQuery({
    queryKey: ["layout"],
    queryFn: () => api.get<GetClusterLayoutResult>("/v2/GetClusterLayout"),
  });
};

export const useConnectNode = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, string>({
    mutationFn: async (nodeId) => {
      const [res] = await api.post("/v2/ConnectClusterNodes", {
        body: [nodeId],
      });
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
    mutationFn: (data) =>
      api.post("/v2/UpdateClusterLayout", {
        body: { parameters: null, roles: [data] },
      }),
    ...(options as any),
  });
};

export const useUnassignNode = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, string>({
    mutationFn: (nodeId) =>
      api.post("/v2/UpdateClusterLayout", {
        body: { parameters: null, roles: [{ id: nodeId, remove: true }] },
      }),
    ...(options as any),
  });
};

export const useRevertChanges = (options?: Partial<UseMutationOptions>) => {
  return useMutation<any, Error, number>({
    mutationFn: () => api.post("/v2/RevertClusterLayout"),
    ...(options as any),
  });
};

export const useApplyChanges = (options?: Partial<UseMutationOptions>) => {
  return useMutation<ApplyLayoutResult, Error, number>({
    mutationFn: (version) =>
      api.post("/v2/ApplyClusterLayout", { body: { version } }),
    ...(options as any),
  });
};
