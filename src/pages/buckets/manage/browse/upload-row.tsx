import { AlertCircle, FileArchive, FileIcon, FileType } from "lucide-react";
import mime from "mime/lite";
import { readableBytes } from "@/lib/utils";
import { UploadRowItem } from "./types";
import UploadRowActions from "./upload-row-actions";

type Props = {
  item: UploadRowItem;
  end?: boolean;
};

const statusLabel = (item: UploadRowItem) => {
  if (item.status === "error") return item.errorMessage ?? "Upload failed";
  if (item.status === "paused") return `Paused at ${item.percent}%`;
  if (item.status === "finishing") return "Saving to storage…";
  return `Uploading — ${item.percent}%`;
};

const UploadRow = ({ item, end }: Props) => {
  const extIdx = item.fileName.lastIndexOf(".");
  const extBare =
    extIdx >= 0 ? item.fileName.substring(extIdx + 1) : null;

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
            <UploadFileIcon ext={extBare} />
          )}
          <span className="truncate min-w-0">{item.fileName}</span>
        </span>
      </td>

      <td className="whitespace-nowrap">{readableBytes(item.size)}</td>

      <td className="whitespace-nowrap" title={statusLabel(item)}>
        {statusLabel(item)}
      </td>

      <UploadRowActions item={item} end={end} />
    </tr>
  );
};

type UploadFileIconProps = {
  ext: string | null;
};

const UploadFileIcon = ({ ext }: UploadFileIconProps) => {
  const type = mime.getType(ext || "")?.split("/")[0];
  let Icon = FileIcon;

  if (
    ["zip", "rar", "7z", "iso", "tar", "gz", "bz2", "xz"].includes(ext || "")
  ) {
    Icon = FileArchive;
  } else if (type === "text") {
    Icon = FileType;
  }

  return (
    <Icon
      size={20}
      className="text-base-content/60 mr-2 shrink-0"
      aria-hidden
    />
  );
};

export default UploadRow;
