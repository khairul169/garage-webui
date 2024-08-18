import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GetObjectsResult, UseBrowserObjectOptions } from "./types";

export const useBrowseObjects = (
  bucket: string,
  options?: UseBrowserObjectOptions
) => {
  return useQuery({
    queryKey: ["browse", bucket, options],
    queryFn: () =>
      api.get<GetObjectsResult>(`/browse/${bucket}`, { params: options }),
  });
};
