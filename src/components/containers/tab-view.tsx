import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { Tabs } from "react-daisyui";
import { useSearchParams } from "react-router-dom";

export type Tab = {
  name: string;
  title?: string;
  icon?: LucideIcon;
  Component?: () => JSX.Element;
};

type Props = {
  tabs: Tab[];
  name?: string;
  className?: string;
  contentClassName?: string;
};

const TabView = ({
  tabs,
  name = "tab",
  className,
  contentClassName,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const curTab = searchParams.get(name) || tabs[0].name;

  const content = useMemo(() => {
    const Comp = tabs.find((tab) => tab.name === curTab)?.Component;
    return Comp ? <Comp /> : null;
  }, [curTab, tabs]);

  return (
    <>
      <Tabs
        variant="boxed"
        className={cn("w-auto inline-flex flex-row items-stretch", className)}
      >
        {tabs.map(({ icon: Icon, ...tab }) => (
          <Tabs.Tab
            key={tab.name}
            active={curTab === tab.name}
            className="flex flex-row items-center gap-x-2 h-auto"
            onClick={() => {
              setSearchParams((params) => {
                params.set(name, tab.name);
                return params;
              });
            }}
          >
            {Icon ? <Icon size={20} /> : null}
            <span>{tab.title || tab.name}</span>
          </Tabs.Tab>
        ))}
      </Tabs>

      <div className={cn("mt-4", contentClassName)}>{content}</div>
    </>
  );
};

export default TabView;
