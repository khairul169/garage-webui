import { AlertCircle } from "lucide-react";
import { readableBytes } from "@/lib/utils";
import BrowseFileTypeIcon from "./file-type-icon";
import { getUploadStatusLabel } from "./upload-status";
import { UploadRowItem } from "./types";
import UploadRowActions from "./upload-row-actions";

type Props = {
  item: UploadRowItem;
};

const fileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.substring(dotIndex + 1) : null;
};

const UploadRow = ({ item }: Props) => {
  const status = getUploadStatusLabel(item);
  const isError = item.status === "error";

  return (
    <tr className="text-base-content/90">
      <td className="cursor-default">
        <span
          className="flex items-center font-normal w-full min-w-0"
          title={item.fileName}
        >
          {isError ? (
            <AlertCircle
              size={20}
              className="text-error mr-2 shrink-0"
              aria-hidden
            />
          ) : (
            <BrowseFileTypeIcon
              ext={fileExtension(item.fileName)}
              className="text-base-content/60 mr-2 shrink-0"
            />
          )}
          <span className="truncate min-w-0">{item.fileName}</span>
        </span>
      </td>

      <td className="whitespace-nowrap">{readableBytes(item.size)}</td>

      <td className="whitespace-nowrap" title={status}>
        {status}
      </td>

      <UploadRowActions item={item} />
    </tr>
  );
};

export default UploadRow;
