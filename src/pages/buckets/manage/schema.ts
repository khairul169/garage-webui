import { z } from "zod";

export const websiteConfigSchema = z.object({
  websiteAccess: z.boolean(),
  websiteConfig: z
    .object({ indexDocument: z.string(), errorDocument: z.string() })
    .nullish(),
});

export type WebsiteConfigSchema = z.infer<typeof websiteConfigSchema>;

export const quotaSchema = z.object({
  enabled: z.boolean(),
  maxObjects: z.coerce.number().nullish(),
  maxSize: z.coerce.number().nullish(),
});

export type QuotaSchema = z.infer<typeof quotaSchema>;
