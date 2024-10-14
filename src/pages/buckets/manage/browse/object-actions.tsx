import { Dropdown } from "react-daisyui";
import { Object } from "./types";
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
    onSuccess: () => {
      toast.success("Object deleted!");
      queryClient.invalidateQueries({ queryKey: ["browse", bucketName] });
    },
    onError: handleError,
  });

  const onDownload = () => {
    window.open(API_URL + object.url + "?dl=1", "_blank");
  };

  const onDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${
          isDirectory ? "directory and its content" : "object"
        }?`
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
