import React, {
  createContext,
  memo,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PageContextValues = {
  title: string | null;
  prev: string | null;
  actions: React.ReactNode | null;
};

export const PageContext = createContext<
  | (PageContextValues & {
    setValue: (values: Partial<PageContextValues>) => void;
  })
  | null
>(null);

const initialValues: PageContextValues = {
  title: null,
  prev: null,
  actions: null,
};

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [values, setValues] = useState<PageContextValues>(initialValues);

  const setValue = useCallback((value: Partial<PageContextValues>) => {
    setValues((prev) => ({ ...prev, ...value }));
  }, []);

  const contextValue = useMemo(() => ({
    ...values,
    setValue
  }), [values, setValue]);

  return (
    <PageContext.Provider children={children} value={contextValue} />
  );
};

type PageProps = Partial<PageContextValues>;

const Page = memo((props: PageProps) => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("Page component must be used within a PageContextProvider");
  }

  const setValueRef = useRef(context.setValue);
  setValueRef.current = context.setValue;

  useEffect(() => {
    setValueRef.current(props);
  }, [props]);

  useEffect(() => {
    return () => {
      setValueRef.current(initialValues);
    };
  }, []);

  return null;
});

export default Page;
