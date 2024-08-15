import fs from "node:fs";
import toml from "toml";

export const readTomlFile = <T = any>(path?: string | null) => {
  if (!path || !fs.existsSync(path)) {
    return undefined;
  }
  return toml.parse(fs.readFileSync(path, "utf8")) as T;
};
