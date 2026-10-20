import {
  FileArchive,
  FileUp,
  FolderPlus,
  FolderUp,
  UploadIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import { usePutObject } from "./hooks";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useBucketContext } from "../context";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Dropdown, Modal } from "react-daisyui";
import { createFolderSchema, CreateFolderSchema } from "./schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { unzip } from "fflate";
import api from "@/lib/api";

type Props = {
  prefix: string;
};

type UploadEntry = {
  key: string;
  file: File;
};

const UPLOAD_CONCURRENCY = 4;

const pickFiles = (opts: { directory?: boolean; accept?: string }) =>
  new Promise<File[]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = !opts.accept;
    input.webkitdirectory = !!opts.directory;
    if (opts.accept) input.accept = opts.accept;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.click();
    input.remove();
  });

const unzipFile = async (file: File) => {
  const data = new Uint8Array(await file.arrayBuffer());
  const entries = await new Promise<Record<string, Uint8Array>>(
    (resolve, reject) =>
      unzip(data, (err, result) => (err ? reject(err) : resolve(result)))
  );

  return Object.entries(entries)
    .filter(([path]) => !path.endsWith("/") && !path.startsWith("__MACOSX/"))
    .map(([path, content]) => ({
      path,
      file: new File([content], path.split("/").pop()!),
    }));
};

const Actions = ({ prefix }: Props) => {
  const { bucketName } = useBucketContext();
  const queryClient = useQueryClient();
  const [isUploading, setUploading] = useState(false);

  const uploadAll = async (entries: UploadEntry[]) => {
    if (!entries.length) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading 0/${entries.length}...`);
    let done = 0;
    let failed = 0;
    const queue = [...entries];

    const worker = async () => {
      for (let entry = queue.shift(); entry; entry = queue.shift()) {
        const formData = new FormData();
        formData.append("file", entry.file);
        try {
          await api.put(`/browse/${bucketName}/${entry.key}`, {
            body: formData,
          });
        } catch {
          failed++;
        }
        done++;
        toast.loading(`Uploading ${done}/${entries.length}...`, {
          id: toastId,
        });
      }
    };

    await Promise.all(
      Array.from({ length: UPLOAD_CONCURRENCY }, () => worker())
    );

    if (failed) {
      toast.error(`${failed} of ${entries.length} uploads failed`, {
        id: toastId,
      });
    } else {
      toast.success(`${entries.length} file(s) uploaded!`, { id: toastId });
    }
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["browse", bucketName] });
  };

  const onUploadFiles = async () => {
    const files = await pickFiles({});
    uploadAll(files.map((file) => ({ key: prefix + file.name, file })));
  };

  const onUploadFolder = async () => {
    const files = await pickFiles({ directory: true });
    uploadAll(
      files.map((file) => ({ key: prefix + file.webkitRelativePath, file }))
    );
  };

  const onRestoreZip = async () => {
    const [zip] = await pickFiles({ accept: ".zip,application/zip" });
    if (!zip) return;

    try {
      const files = await unzipFile(zip);
      uploadAll(files.map(({ path, file }) => ({ key: prefix + path, file })));
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <>
      <CreateFolderAction prefix={prefix} />
      <Dropdown end>
        <Dropdown.Toggle button={false}>
          <Button
            icon={UploadIcon}
            color="ghost"
            title="Upload"
            disabled={isUploading}
          />
        </Dropdown.Toggle>
        <Dropdown.Menu className="gap-y-1 w-56">
          <Dropdown.Item onClick={onUploadFiles}>
            <FileUp /> Upload files
          </Dropdown.Item>
          <Dropdown.Item onClick={onUploadFolder}>
            <FolderUp /> Upload folder
          </Dropdown.Item>
          <Dropdown.Item onClick={onRestoreZip}>
            <FileArchive /> Restore from zip
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
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
    createFolder.mutate({ key: `${prefix}${values.name}/`, file: null });
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
