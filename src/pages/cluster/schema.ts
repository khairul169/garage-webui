import { z } from "zod";

export const connectNodeSchema = z.object({
  nodeId: z.string().min(1, "Node ID is required"),
});

export type ConnectNodeSchema = z.infer<typeof connectNodeSchema>;

export const capacityUnits = ["MB", "GB", "TB"] as const;

export const assignNodeSchema = z
  .object({
    nodeId: z.string().min(1, "Node ID is required"),
    zone: z.string().min(1, 'Zone is required, e.g. "dc1"'),
    capacity: z.coerce.number().nullish(),
    capacityUnit: z.enum(capacityUnits),
    isGateway: z.boolean(),
    tags: z.string().min(1).array(),
  })
  .refine(
    (values) => values.isGateway || (values.capacity && values.capacity > 0),
    {
      message: "Capacity required",
      path: ["capacity"],
    }
  );

export type AssignNodeSchema = z.infer<typeof assignNodeSchema>;

export const calculateCapacity = (
  value?: number | null,
  unit?: (typeof capacityUnits)[number]
) => {
  if (!value || !unit) return 0;
  return value * 1000 ** (capacityUnits.indexOf(unit) + 2);
};

export const parseCapacity = (value?: number | null) => {
  if (!value) {
    return { value: 0, unit: undefined };
  }

  for (let i = capacityUnits.length - 1; i >= 0; i--) {
    if (value >= 1000 ** (i + 2)) {
      return {
        value: Math.floor(value / 1000 ** (i + 2)),
        unit: capacityUnits[i],
      };
    }
  }

  return { value, unit: undefined };
};
