import clsx from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import dayjsRelativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { BASE_PATH } from "./consts";

dayjs.extend(dayjsRelativeTime);
export { dayjs };

export const cn = (...args: any[]) => {
  return twMerge(clsx(...args));
};

export const ucfirst = (text?: string | null) => {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
};

export const readableBytes = (bytes?: number | null, divider = 1024) => {
  if (bytes == null || Number.isNaN(bytes)) return "n/a";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(divider)));

  return `${(bytes / Math.pow(divider, i)).toFixed(1)} ${sizes[i]}`;
};

export const handleError = (err: unknown) => {
  toast.error((err as Error)?.message || "Unknown error");
};

export const copyToClipboard = async (text: string) => {
  let textArea: HTMLTextAreaElement | undefined;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      textArea = document.createElement("textarea");
      textArea.value = text;

      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();
      document.execCommand("copy");
    }

    toast.success("Copied to clipboard");
  } catch (err) {
    handleError(err);
  } finally {
    textArea?.remove();
  }
};

export const url = (...paths: unknown[]) => {
  return BASE_PATH + paths.join("/");
};
