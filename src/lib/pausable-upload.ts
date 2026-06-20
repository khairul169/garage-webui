//#region 常量/配置

const CHUNK_SIZE = 512 * 1024;

//#endregion

//#region 模型/类型

type StreamPhase = "header" | "body" | "footer";

type PausableStreamState = {
  paused: boolean;
  aborted: boolean;
  offset: number;
};

export type PausableUploadProgress = {
  percent: number;
  phase: "uploading" | "finishing";
};

export type PausableUploadHandle<T = unknown> = {
  promise: Promise<T>;
  pause: () => void;
  resume: () => void;
  abort: () => void;
};

//#endregion

//#region 方法/工具

const escapeMultipartFilename = (name: string) =>
  name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const createMultipartFileStream = (
  file: File,
  boundary: string,
  state: PausableStreamState,
  onBytesSent: (sent: number, total: number) => void
) => {
  const encoder = new TextEncoder();
  const header = encoder.encode(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${escapeMultipartFilename(file.name)}"\r\n` +
      `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`
  );
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);
  let phase: StreamPhase = "header";

  const waitWhilePaused = async () => {
    while (state.paused && !state.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (state.aborted) {
        controller.error(new DOMException("Upload aborted", "AbortError"));
        return;
      }

      await waitWhilePaused();

      if (state.aborted) {
        controller.error(new DOMException("Upload aborted", "AbortError"));
        return;
      }

      if (phase === "header") {
        controller.enqueue(header);
        phase = "body";
        onBytesSent(0, file.size);
        return;
      }

      if (phase === "body") {
        if (state.offset < file.size) {
          await waitWhilePaused();
          if (state.aborted) {
            controller.error(new DOMException("Upload aborted", "AbortError"));
            return;
          }

          const end = Math.min(state.offset + CHUNK_SIZE, file.size);
          const chunk = await file.slice(state.offset, end).arrayBuffer();
          controller.enqueue(new Uint8Array(chunk));
          state.offset = end;
          onBytesSent(state.offset, file.size);
          return;
        }

        phase = "footer";
      }

      if (phase === "footer") {
        controller.enqueue(footer);
        controller.close();
      }
    },
  });
};

//#endregion

//#region 公开 API

export const startPausableUpload = <T = unknown>(
  url: string,
  file: File,
  options?: {
    onProgress?: (event: PausableUploadProgress) => void;
    timeoutMs?: number;
    onUnauthorized?: () => void;
  }
): PausableUploadHandle<T> => {
  const boundary = `----GarageUpload${Math.random().toString(36).slice(2, 12)}`;
  const state: PausableStreamState = {
    paused: false,
    aborted: false,
    offset: 0,
  };
  const abortController = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 3_600_000;
  let bodyFinished = false;

  const timeoutId = window.setTimeout(() => {
    state.aborted = true;
    abortController.abort();
  }, timeoutMs);

  const stream = createMultipartFileStream(file, boundary, state, (sent, total) => {
    if (bodyFinished) return;

    if (sent >= total) {
      bodyFinished = true;
      options?.onProgress?.({ phase: "finishing", percent: 99 });
      return;
    }

    const sentPercent = Math.round((sent / total) * 100);
    options?.onProgress?.({
      phase: "uploading",
      percent: Math.min(95, sentPercent),
    });
  });

  const promise = fetch(url, {
    method: "PUT",
    body: stream,
    credentials: "include",
    signal: abortController.signal,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    duplex: "half",
  } as RequestInit)
    .then(async (res) => {
      window.clearTimeout(timeoutId);

      const contentType = res.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (res.status === 401) {
        options?.onUnauthorized?.();
        throw new Error("unauthorized");
      }

      if (!res.ok) {
        const message = isJson
          ? (data as { message?: string })?.message
          : typeof data === "string"
          ? data
          : res.statusText;
        throw new Error(message || res.statusText);
      }

      return data as T;
    })
    .catch((error) => {
      window.clearTimeout(timeoutId);
      throw error;
    });

  return {
    promise,
    pause: () => {
      state.paused = true;
    },
    resume: () => {
      state.paused = false;
    },
    abort: () => {
      state.aborted = true;
      abortController.abort();
    },
  };
};

//#endregion
