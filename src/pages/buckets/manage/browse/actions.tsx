import { FolderPlus, UploadIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { handleError, openFilePicker } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useBucketContext } from "../context";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Modal } from "react-daisyui";
import { createFolderSchema, CreateFolderSchema } from "./schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input";
import { useEffect } from "react";
import { usePutObject } from "./hooks";
import { useUploadQueue } from "./upload-queue";

type Props = {
  prefix: string;
};

const Actions = ({ prefix }: Props) => {
  const { bucketName } = useBucketContext();
  const { enqueueFiles } = useUploadQueue();

  const onUploadFile = () => {
    openFilePicker((files) => {
      if (files.length > 20) {
        toast.error("You can only upload up to 20 files at a time");
        return;
      }

      enqueueFiles(
        bucketName,
        prefix,
        Array.from(files)
      );
    }, { multiple: true });
  };

  return (
    <>
      <CreateFolderAction prefix={prefix} />
      <Button
        icon={UploadIcon}
        color="ghost"
        title="Upload File"
        onClick={onUploadFile}
      />
    </>
  );
};

type CreateFolderActionProps = {
  prefix: string;
};

const CreateFolderAction = ({ prefix }: CreateFolderActionProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { bucketName } = useBucketContext();
  const queryClient = useQueryClient();

  const form = useForm<CreateFolderSchema>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isOpen) form.setFocus("name");
  }, [isOpen]);

  const createFolder = usePutObject(bucketName, {
    onSuccess: () => {
      toast.success("Folder created!");
      queryClient.invalidateQueries({ queryKey: ["browse", bucketName] });
      onClose();
      form.reset();
    },
    onError: handleError,
  });

  const onSubmit = form.handleSubmit((values) => {
    createFolder.mutate({ key: `${prefix}${values.name}/` });
  });

  return (
    <>
      <Button
        icon={FolderPlus}
        color="ghost"
        onClick={onOpen}
        title="Create Folder"
      />

      <Modal open={isOpen}>
        <Modal.Header>Create Folder</Modal.Header>

        <Modal.Body>
          <form onSubmit={onSubmit}>
            <InputField form={form} name="name" title="Name" />
          </form>
        </Modal.Body>

        <Modal.Actions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            onClick={onSubmit}
            disabled={createFolder.isPending}
          >
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Actions;
