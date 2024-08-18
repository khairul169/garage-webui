import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

type Props = {
  bucketName?: string;
  curPrefix: number;
  setCurPrefix: React.Dispatch<React.SetStateAction<number>>;
  prefixHistory: string[];
  actions?: React.ReactNode;
};

const ObjectListNavigator = ({
  bucketName,
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

      <div className="order-3 md:order-2 flex flex-row w-full overflow-x-auto items-center bg-base-200 h-10 flex-1 shrink-0 min-w-[80%] md:min-w-0 rounded-lg mx-2 pl-4">
        <HistoryItem
          title={bucketName}
          isActive={curPrefix === -1}
          onClick={() => setCurPrefix(-1)}
        />

        {prefixHistory.map((prefix, i) => (
          <Fragment key={prefix}>
            <ChevronRight className="shrink-0" size={20} />
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
  title?: string;
  isActive: boolean;
  onClick: () => void;
};

const HistoryItem = ({ title, isActive, onClick }: HistoryItemProps) => {
  if (!title) {
    return null;
  }

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn("px-2 rounded-sm shrink-0", isActive && "bg-neutral")}
    >
      {title}
    </a>
  );
};

export default ObjectListNavigator;
