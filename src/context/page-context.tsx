import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type PageContextValues = {
  title?: string | null;
  setTitle: (title?: string | null) => void;
};

export const PageContext = createContext<PageContextValues | null>(null);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [title, setTitle] = useState<PageContextValues["title"]>(null);

  const contextValues = {
    title,
    setTitle,
  };

  return <PageContext.Provider children={children} value={contextValues} />;
};

type PageProps = {
  title?: string;
};

const Page = ({ title }: PageProps) => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("Page component must be used within a PageContextProvider");
  }

  useEffect(() => {
    context.setTitle(title);

    return () => {
      context.setTitle(null);
    };
  }, [title, context.setTitle]);

  return null;
};

export default Page;
