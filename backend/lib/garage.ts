import type { Config } from "../types/garage";
import { readTomlFile } from "./utils";

export const config = readTomlFile<Config>(process.env.CONFIG_PATH);
