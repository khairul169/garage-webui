import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Home, LucideIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

type Props = {
  curPrefix: number;
  setCurPrefix: React.Dispatch<React.SetStateAction<number>>;
  prefixHistory: string[];
  actions?: React.ReactNode;
};

const ObjectListNavigator = ({
  curPrefix,
  setCurPrefix,
  prefixHistory,
  actions,
}: Props) => {
  const onGoBack = () => {
    if (curPrefix >= 0) setCurPrefix(curPrefix - 1);
  };

  const onGoForward = () => {
    if (curPrefix < prefixHistory.length - 1) setCurPrefix(curPrefix + 1);
  };

  return (
    <div className="flex flex-row flex-wrap items-center p-2 gap-y-2">
      <div className="order-1 flex flex-row items-center">
        <Button
          icon={ChevronLeft}
          color="ghost"
          disabled={curPrefix < 0}
          onClick={onGoBack}
          className="col-span-2"
        />
        <Button
          icon={ChevronRight}
          color="ghost"
          disabled={curPrefix >= prefixHistory.length - 1}
          onClick={onGoForward}
          className="col-span-2"
        />
      </div>

      <div className="order-3 md:order-2 flex flex-row w-full overflow-x-auto items-center bg-base-200 h-10 flex-1 shrink-0 min-w-[80%] md:min-w-0 rounded-lg mx-2 px-2">
        <HistoryItem
          icon={Home}
          isActive={curPrefix === -1}
          onClick={() => setCurPrefix(-1)}
        />

        {prefixHistory.map((prefix, i) => (
          <Fragment key={prefix}>
            <ChevronRight className="shrink-0" size={18} />
            <HistoryItem
              title={prefix
                .substring(0, prefix.lastIndexOf("/"))
                .split("/")
                .pop()}
              isActive={i === curPrefix}
              onClick={() => setCurPrefix(i)}
            />
          </Fragment>
        ))}
      </div>

      <div className="order-2 flex flex-row items-center flex-1 md:order-3 md:flex-initial justify-end">
        {actions}
      </div>
    </div>
  );
};

type HistoryItemProps = {
  icon?: LucideIcon;
  title?: string;
  isActive: boolean;
  onClick: () => void;
};

const HistoryItem = ({
  icon: Icon,
  title,
  isActive,
  onClick,
}: HistoryItemProps) => {
  if (!title && !Icon) {
    return null;
  }

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "px-2 rounded-md shrink-0 max-w-[150px] truncate",
        isActive && "bg-neutral",
        Icon ? "py-1" : null
      )}
    >
      {Icon ? <Icon size={18} /> : null}
      {title}
    </a>
  );
};

export default ObjectListNavigator;
