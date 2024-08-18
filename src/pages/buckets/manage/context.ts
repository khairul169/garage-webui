import { createContext, useContext } from "react";
import { Bucket } from "../types";

export const BucketContext = createContext<{
  bucket: Bucket;
  refetch: () => void;
  bucketName: string;
} | null>(null);

export const useBucketContext = () => {
  const bucket = useContext(BucketContext);
  if (!bucket) {
    throw new Error(
      "BucketContext must be used within a BucketContextProvider"
    );
  }

  return bucket;
};
