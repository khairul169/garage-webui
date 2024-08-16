import type { Config } from "../types/garage";
import { readTomlFile } from "./utils";

const CONFIG_PATH = process.env.CONFIG_PATH || "/etc/garage.toml";

export const config = await readTomlFile<Config>(CONFIG_PATH);

if (!config?.rpc_public_addr) {
  throw new Error(
    "Cannot load garage config! Missing `rpc_public_addr` in config file."
  );
}

if (!config?.admin?.admin_token) {
  throw new Error("Missing `admin.admin_token` in config.");
}
