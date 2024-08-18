import { useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";

export const createDisclosure = <T = any>() => {
  const store = createStore(() => ({
    data: undefined as T | null,
    isOpen: false,
  }));

  const useDisclosure = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const data = useStore(store);

    useEffect(() => {
      const dlg = dialogRef.current;
      if (!dlg || !data.isOpen) return;

      const onDialogClose = () => {
        store.setState({ isOpen: false });
      };

      dlg.addEventListener("close", onDialogClose);
      return () => dlg.removeEventListener("close", onDialogClose);
    }, [dialogRef, data.isOpen]);

    return { ...data, dialogRef } as const;
  };

  return {
    store,
    use: useDisclosure,
    open: (data?: T | null) => store.setState({ isOpen: true, data }),
    close: () => store.setState({ isOpen: false }),
  };
};
