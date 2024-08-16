import appStore from "@/stores/app-store";
import { useEffect } from "react";
import { useStore } from "zustand";

const ThemeProvider = () => {
  const theme = useStore(appStore, (i) => i.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
};

export default ThemeProvider;
