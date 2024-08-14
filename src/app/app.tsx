import { PageContextProvider } from "@/context/page-context";
import Router from "./router";
import "./styles.css";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PageContextProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
      <Toaster richColors />
    </PageContextProvider>
  );
};

export default App;
