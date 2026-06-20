import Button from "@/components/ui/button";
import { PauseIcon, PlayIcon, XCircle } from "lucide-react";
import { UploadRowItem } from "./types";
import { useUploadQueue } from "./upload-queue";

type Props = {
  item: UploadRowItem;
  end?: boolean;
};

const UploadRowActions = ({ item, end: _end }: Props) => {
  const { pauseUpload, resumeUpload, cancelUpload } = useUploadQueue();
  const isPaused = item.status === "paused";
  const isActive = item.status === "uploading" || item.status === "finishing";

  return (
    <td className="!p-0 w-auto">
      <span className="w-full flex flex-row justify-end pr-2 gap-0.5">
        {(isActive || isPaused) && (
          <Button
            icon={isPaused ? PlayIcon : PauseIcon}
            color="ghost"
            title={isPaused ? "Resume upload" : "Pause upload"}
            onClick={() =>
              isPaused ? resumeUpload(item.id) : pauseUpload(item.id)
            }
          />
        )}

        <Button
          icon={XCircle}
          color="ghost"
          className="text-error hover:text-error"
          title="Cancel upload"
          onClick={() => cancelUpload(item.id)}
        />
      </span>
    </td>
  );
};

export default UploadRowActions;
