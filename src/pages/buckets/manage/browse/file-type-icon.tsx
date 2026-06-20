import mime from "mime/lite";
import {
  FileArchive,
  FileIcon,
  FileType,
  type LucideIcon,
} from "lucide-react";

const ARCHIVE_EXTENSIONS = [
  "zip",
  "rar",
  "7z",
  "iso",
  "tar",
  "gz",
  "bz2",
  "xz",
];

export const getBrowseFileIcon = (ext?: string | null): LucideIcon => {
  if (ARCHIVE_EXTENSIONS.includes(ext || "")) return FileArchive;

  const type = mime.getType(ext || "")?.split("/")[0];
  if (type === "text") return FileType;

  return FileIcon;
};

type Props = {
  ext?: string | null;
  className?: string;
};

const BrowseFileTypeIcon = ({ ext, className }: Props) => {
  const Icon = getBrowseFileIcon(ext);
  return <Icon size={20} className={className} aria-hidden />;
};

export default BrowseFileTypeIcon;
