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

export interface ConnectNodeResult {
  success: boolean;
  error?: string;
  // Add other fields if the API returns more data
}

export const useConnectNode = (options?: Partial<UseMutationOptions<ConnectNodeResult, Error, string>>) => {
  return useMutation<ConnectNodeResult, Error, string>({
    mutationFn: async (nodeId) => {
const res = await api.post<ConnectNodeResult>("/v2/ConnectClusterNodes", { body: [nodeId] });
      return res;
    },
    ...options,
  });
};

export const useAssignNode = (options?: Partial<UseMutationOptions<void, Error, AssignNodeBody>>) => {
  return useMutation<void, Error, AssignNodeBody>({
    mutationFn: (data) => api.post("/v2/UpdateClusterLayout", { body: { parameters: data.parameters, roles: data.roles } }),
    ...options,
  });
};

export const useUnassignNode = (options?: Partial<UseMutationOptions<void, Error, string>>) => {
  return useMutation<void, Error, string>({
    mutationFn: (nodeId) =>
api.post("/v2/UpdateClusterLayout", { body: { parameters: null, roles: [{ id: nodeId, remove: true }] } }),
    ...options,
  });
};

export const useRevertChanges = (options?: Partial<UseMutationOptions<void, Error, number>>) => {
  return useMutation<void, Error, number>({
    mutationFn: (version) =>
      api.post("/v2/RevertClusterLayout", { body: { version } }),
    ...options,
  });
};

export const useApplyChanges = (options?: Partial<UseMutationOptions<ApplyLayoutResult, Error, number>>) => {
  return useMutation<ApplyLayoutResult, Error, number>({
    mutationFn: (version) =>
      api.post("/v2/ApplyClusterLayout", { body: { version } }),
    ...options,
  });
};
