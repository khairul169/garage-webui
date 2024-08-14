import { createStore, useStore } from "zustand";

export const createDisclosure = <T = any>() => {
  const store = createStore(() => ({
    data: undefined as T | null,
    isOpen: false,
  }));

  return {
    store,
    use: () => useStore(store),
    open: (data?: T | null) => store.setState({ isOpen: true, data }),
    close: () => store.setState({ isOpen: false }),
  };
};
