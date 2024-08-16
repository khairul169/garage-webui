import { z } from "zod";

export const createKeySchema = z
  .object({
    name: z
      .string()
      .min(1, "Key Name is required")
      .regex(/^[a-zA-Z0-9_-]+$/, "Key Name invalid"),
    isImport: z.boolean().nullish(),
    accessKeyId: z.string().nullish(),
    secretAccessKey: z.string().nullish(),
  })
  .refine(
    (v) => !v.isImport || (v.accessKeyId != null && v.accessKeyId.length > 0),
    { message: "Access key ID is required", path: ["accessKeyId"] }
  )
  .refine(
    (v) =>
      !v.isImport ||
      (v.secretAccessKey != null && v.secretAccessKey.length > 0),
    { message: "Secret access key is required", path: ["secretAccessKey"] }
  );

export type CreateKeySchema = z.infer<typeof createKeySchema>;
