import api from "@/lib/api";
import { Config } from "@/types/garage";
import { useQuery } from "@tanstack/react-query";

export const useConfig = () => {
  return useQuery<Config>({
    queryKey: ["config"],
    queryFn: () => api.get("/config"),
  });
};
