import clsx from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export const cn = (...args: any[]) => {
  return twMerge(clsx(...args));
};

export const ucfirst = (text?: string | null) => {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
};

export const readableBytes = (bytes?: number | null, divider = 1024) => {
  if (bytes == null || Number.isNaN(bytes)) return "n/a";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = Math.floor(Math.log(bytes) / Math.log(divider));

  return `${(bytes / Math.pow(divider, i)).toFixed(1)} ${sizes[i]}`;
};

export const handleError = (err: unknown) => {
  toast.error((err as Error)?.message || "Unknown error");
};
