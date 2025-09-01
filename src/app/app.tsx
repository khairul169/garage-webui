import { PageContextProvider } from "@/context/page-context";
import Router from "./router";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ThemeProvider from "@/components/containers/theme-provider";
import "./styles.css";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [test, setTest] = useState();

  console.log({test});

  return (
    <PageContextProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
      <Toaster richColors />
      <ThemeProvider />
    </PageContextProvider>
  );
};

export default App;
