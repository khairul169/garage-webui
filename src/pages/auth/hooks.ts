import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { loginSchema } from "./schema";
import api from "@/lib/api";
import { toast } from "sonner";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: z.infer<typeof loginSchema>) => {
      return api.post("/auth/login", { body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Unknown error");
    },
  });
};
