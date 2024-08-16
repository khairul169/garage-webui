import { z } from "zod";

export const createBucketSchema = z.object({
  globalAlias: z.string().min(1, "Bucket Name is required"),
});

export type CreateBucketSchema = z.infer<typeof createBucketSchema>;
