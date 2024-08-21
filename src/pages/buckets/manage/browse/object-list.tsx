import { Table } from "react-daisyui";
import { useBrowseObjects } from "./hooks";
import { dayjs, readableBytes } from "@/lib/utils";
import mime from "mime/lite";
import { Object } from "./types";
import { API_URL } from "@/lib/api";
import { FileArchive, FileIcon, FileType, Folder } from "lucide-react";
import { useBucketContext } from "../context";
import ObjectActions from "./object-actions";
import GotoTopButton from "@/components/ui/goto-top-btn";

type Props = {
  prefix?: string;
  onPrefixChange?: (prefix: string) => void;
};

const ObjectList = ({ prefix, onPrefixChange }: Props) => {
  const { bucketName } = useBucketContext();
  const { data } = useBrowseObjects(bucketName, { prefix, limit: 1000 });

  const onObjectClick = (object: Object) => {
    window.open(API_URL + object.viewUrl, "_blank");
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <Table>
        <Table.Head>
          <span>Name</span>
          <span>Size</span>
          <span>Last Modified</span>
        </Table.Head>

        <Table.Body>
          {!data?.prefixes?.length && !data?.objects?.length && (
            <tr>
              <td className="text-center py-8" colSpan={3}>
                No objects
              </td>
            </tr>
          )}

          {data?.prefixes.map((prefix) => (
            <tr
              key={prefix}
              className="hover:bg-neutral/60 hover:text-neutral-content group"
            >
              <td
                className="cursor-pointer"
                role="button"
                onClick={() => onPrefixChange?.(prefix)}
              >
                <span className="flex items-center gap-2 font-normal">
                  <Folder size={20} className="text-primary" />
                  {prefix
                    .substring(0, prefix.lastIndexOf("/"))
                    .split("/")
                    .pop()}
                </span>
              </td>
              <td colSpan={2} />
              <ObjectActions object={{ objectKey: prefix, downloadUrl: "" }} />
            </tr>
          ))}

          {data?.objects.map((object, idx) => {
            const extIdx = object.objectKey.lastIndexOf(".");
            const filename =
              extIdx >= 0
                ? object.objectKey.substring(0, extIdx)
                : object.objectKey;
            const ext = extIdx >= 0 ? object.objectKey.substring(extIdx) : null;

            return (
              <tr
                key={object.objectKey}
                className="hover:bg-neutral/60 hover:text-neutral-content group"
              >
                <td
                  className="cursor-pointer"
                  role="button"
                  onClick={() => onObjectClick(object)}
                >
                  <span className="flex items-center font-normal w-full">
                    <FilePreview ext={ext?.substring(1)} object={object} />
                    <span className="truncate max-w-[40vw]">{filename}</span>
                    {ext && <span className="text-base-content/60">{ext}</span>}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  {readableBytes(object.size)}
                </td>
                <td className="whitespace-nowrap">
                  {dayjs(object.lastModified).fromNow()}
                </td>
                <ObjectActions
                  prefix={data.prefix}
                  object={object}
                  end={idx >= data.objects.length - 2}
                />
              </tr>
            );
          })}
        </Table.Body>
      </Table>

      <GotoTopButton />
    </div>
  );
};

type FilePreviewProps = {
  ext?: string | null;
  object: Object;
};

const FilePreview = ({ ext, object }: FilePreviewProps) => {
  const type = mime.getType(ext || "")?.split("/")[0];
  let Icon = FileIcon;

  if (
    ["zip", "rar", "7z", "iso", "tar", "gz", "bz2", "xz"].includes(ext || "")
  ) {
    Icon = FileArchive;
  }

  if (type === "image") {
    return (
      <img
        src={API_URL + object.viewUrl}
        alt={object.objectKey}
        className="size-5 object-cover overflow-hidden mr-2"
      />
    );
  }

  if (type === "text") {
    Icon = FileType;
  }

  return (
    <Icon
      size={20}
      className="text-base-content/60 group-hover:text-neutral-content/80 mr-2"
    />
  );
};

export default ObjectList;
