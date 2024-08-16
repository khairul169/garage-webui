import toml from "toml";

export const readTomlFile = async <T = any>(path?: string | null) => {
  if (!path) {
    return undefined;
  }

  const file = Bun.file(path);
  if (!(await file.exists())) {
    return undefined;
  }

  return toml.parse(await file.text()) as T;
};
