import { Themes } from "@/app/themes";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  theme: Themes;
};

const store = createStore(
  persist<AppState>(
    () => ({
      theme: "pastel",
    }),
    {
      name: "appdata",
    }
  )
);

const appStore = {
  ...store,
  setTheme: (theme: AppState["theme"]) => store.setState({ theme }),
};

export default appStore;
