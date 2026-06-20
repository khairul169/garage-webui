import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";
import { startPausableUpload } from "@/lib/pausable-upload";
import { url } from "@/lib/utils";
import { toUploadErrorMessage } from "./upload-status";
import {
  UploadRowItem,
  UploadRowPhase,
  UploadRowStatus,
} from "./types";

type ActiveUpload = {
  pause: () => void;
  resume: () => void;
  abort: () => void;
};

type UploadQueueContextValue = {
  items: UploadRowItem[];
  enqueueFiles: (bucket: string, prefix: string, files: File[]) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  getItemsForLocation: (bucket: string, prefix: string) => UploadRowItem[];
};

const UploadQueueContext = createContext<UploadQueueContextValue | null>(null);

const createUploadId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const progressToStatus = (phase: UploadRowPhase): UploadRowStatus =>
  phase === "finishing" ? "finishing" : "uploading";

const createUploadItem = (
  id: string,
  bucket: string,
  prefix: string,
  file: File
): UploadRowItem => ({
  id,
  bucket,
  prefix,
  key: prefix + file.name,
  fileName: file.name,
  size: file.size,
  percent: 0,
  phase: "uploading",
  status: "uploading",
});

export const UploadQueueProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<UploadRowItem[]>([]);
  const activeRef = useRef<Map<string, ActiveUpload>>(new Map());
  const cancelledRef = useRef<Set<string>>(new Set());

  const patchItem = useCallback(
    (id: string, patch: Partial<UploadRowItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    activeRef.current.delete(id);
    cancelledRef.current.delete(id);
  }, []);

  const runUpload = useCallback(
    (id: string, bucket: string, key: string, file: File) => {
      let lastEventKey = "";

      const handle = startPausableUpload(
        `${API_URL}/browse/${bucket}/${key}`,
        file,
        {
          onUnauthorized: () => {
            window.location.href = url("/auth/login");
          },
          onProgress: (event) => {
            const eventKey = `${event.phase}:${event.percent}`;
            if (eventKey === lastEventKey) return;
            lastEventKey = eventKey;

            patchItem(id, {
              percent: event.percent,
              phase: event.phase as UploadRowPhase,
              status: progressToStatus(event.phase as UploadRowPhase),
            });
          },
        }
      );

      activeRef.current.set(id, {
        pause: handle.pause,
        resume: handle.resume,
        abort: handle.abort,
      });

      handle.promise
        .then(() => {
          removeItem(id);
          queryClient.invalidateQueries({ queryKey: ["browse", bucket] });
        })
        .catch((error) => {
          activeRef.current.delete(id);

          if (cancelledRef.current.has(id)) {
            removeItem(id);
            return;
          }

          const message = toUploadErrorMessage(error);
          if (!message) return;

          patchItem(id, { status: "error", errorMessage: message });
        });
    },
    [patchItem, queryClient, removeItem]
  );

  const enqueueFiles = useCallback(
    (bucket: string, prefix: string, files: File[]) => {
      for (const file of files) {
        const id = createUploadId();
        setItems((prev) => [...prev, createUploadItem(id, bucket, prefix, file)]);
        runUpload(id, bucket, prefix + file.name, file);
      }
    },
    [runUpload]
  );

  const pauseUpload = useCallback(
    (id: string) => {
      const active = activeRef.current.get(id);
      if (!active) return;

      active.pause();
      patchItem(id, { status: "paused", phase: "paused" });
    },
    [patchItem]
  );

  const resumeUpload = useCallback(
    (id: string) => {
      const active = activeRef.current.get(id);
      const item = items.find((entry) => entry.id === id);
      if (!active || !item || item.status !== "paused") return;

      patchItem(id, {
        status: "uploading",
        phase: "uploading",
        errorMessage: undefined,
      });
      active.resume();
    },
    [items, patchItem]
  );

  const cancelUpload = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      if (
        !window.confirm(
          `Cancel upload and remove "${item.fileName}" from the list?`
        )
      ) {
        return;
      }

      cancelledRef.current.add(id);
      const active = activeRef.current.get(id);
      if (active) active.abort();
      else removeItem(id);
    },
    [items, removeItem]
  );

  const getItemsForLocation = useCallback(
    (bucket: string, prefix: string) =>
      items.filter((item) => item.bucket === bucket && item.prefix === prefix),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      enqueueFiles,
      pauseUpload,
      resumeUpload,
      cancelUpload,
      getItemsForLocation,
    }),
    [
      items,
      enqueueFiles,
      pauseUpload,
      resumeUpload,
      cancelUpload,
      getItemsForLocation,
    ]
  );

  return (
    <UploadQueueContext.Provider value={value}>
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploadQueue = () => {
  const ctx = useContext(UploadQueueContext);
  if (!ctx) {
    throw new Error("useUploadQueue must be used within UploadQueueProvider");
  }
  return ctx;
};
