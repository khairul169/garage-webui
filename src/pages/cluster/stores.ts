import { createDisclosure } from "@/lib/disclosure";
import { AssignNodeSchema } from "./schema";

export const assignNodeDialog = createDisclosure<Partial<AssignNodeSchema>>();
