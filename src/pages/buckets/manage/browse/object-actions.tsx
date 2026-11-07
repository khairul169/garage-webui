import { Dropdown } from "react-daisyui";
import { DeleteObjectsResult, Object } from "./types";
import Button from "@/components/ui/button";
import { DownloadIcon, EllipsisVertical, Share2, Trash } from "lucide-react";
import { useDeleteObject } from "./hooks";
import { useBucketContext } from "../context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { shareDialog } from "./share-dialog";

type Props = {
  prefix?: string;
  object: Pick<Object, "objectKey" | "url">;
  end?: boolean;
};

const ObjectActions = ({ prefix = "", object, end }: Props) => {
  const { bucketName } = useBucketContext();
  const queryClient = useQueryClient();
  const isDirectory = object.objectKey.endsWith("/");

  const deleteObject = useDeleteObject(bucketName, {
    onSuccess: (data) => {
      const result = data as DeleteObjectsResult;
      if (typeof result.deleted === "number") {
        const failures = result.errors ?? [];
        if (failures.length > 0) {
          const keys = failures
            .map((error) => error.key)
            .filter(Boolean)
            .slice(0, 3)
            .join(", ");
          toast.warning(
            `Deleted ${result.deleted} objects, but ${failures.length} failed` +
              (keys ? ` (${keys})` : "") +
              "."
          );
        } else {
          toast.success(`Deleted ${result.deleted} objects!`);
        }
      } else {
        toast.success("Object deleted!");
      }
      queryClient.invalidateQueries({ queryKey: ["browse", bucketName] });
    },
    onError: handleError,
  });

  const onDownload = () => {
    window.open(API_URL + object.url + "?dl=1", "_blank");
  };

  const onDelete = () => {
    const objectPath = `${bucketName}/${prefix}${object.objectKey}`;
    if (
      window.confirm(
        isDirectory
          ? `Are you sure you want to delete the directory "${objectPath}" and all of its contents?`
          : `Are you sure you want to delete "${objectPath}"?`
      )
    ) {
      deleteObject.mutate({
        key: prefix + object.objectKey,
        recursive: isDirectory,
      });
    }
  };

  return (
    <td className="!p-0 w-auto">
      <span className="w-full flex flex-row justify-end pr-2">
        {!isDirectory && (
          <Button icon={DownloadIcon} color="ghost" onClick={onDownload} />
        )}

        <Dropdown end vertical={end ? "top" : "bottom"}>
          <Dropdown.Toggle button={false}>
            <Button icon={EllipsisVertical} color="ghost" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="gap-y-1">
            <Dropdown.Item
              onClick={() =>
                shareDialog.open({ key: object.objectKey, prefix })
              }
            >
              <Share2 /> Share
            </Dropdown.Item>
            <Dropdown.Item
              className="text-error bg-error/10"
              onClick={onDelete}
            >
              <Trash /> Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </span>
    </td>
  );
};

export default ObjectActions;
