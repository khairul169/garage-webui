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

/** Delay before removing an unused file input after the picker closes without a selection. */
const FILE_PICKER_CANCEL_CLEANUP_MS = 500;

export type OpenFilePickerOptions = {
  multiple?: boolean;
};

/**
 * Opens the native file picker and passes the chosen files to `onSelect`.
 * The input is mounted in the document until selection completes; removing it
 * immediately after `click()` prevents `change` from firing in some browsers.
 */
export const openFilePicker = (
  onSelect: (files: FileList) => void,
  options: OpenFilePickerOptions = {}
) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = options.multiple ?? false;

  // Keep off-screen but attached, same approach as copyToClipboard().
  input.style.position = "absolute";
  input.style.left = "-999999px";

  const cleanup = () => {
    input.remove();
    window.removeEventListener("focus", onCancelFocus);
  };

  const onCancelFocus = () => {
    // Cancel closes the picker without firing change; defer so change can run first.
    setTimeout(() => {
      if (document.body.contains(input)) cleanup();
    }, FILE_PICKER_CANCEL_CLEANUP_MS);
  };

  input.onchange = (e) => {
    cleanup();
    const files = (e.target as HTMLInputElement).files;
    if (files?.length) onSelect(files);
  };

  document.body.prepend(input);
  window.addEventListener("focus", onCancelFocus, { once: true });
  input.click();
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
