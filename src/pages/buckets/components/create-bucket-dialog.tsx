import Button from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Modal } from "react-daisyui";
import { useForm } from "react-hook-form";
import { useDisclosure } from "@/hooks/useDisclosure";
import { createBucketSchema, CreateBucketSchema } from "../schema";
import { InputField } from "@/components/ui/input";
import { useCreateBucket } from "../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";

const CreateBucketDialog = () => {
  const { dialogRef, isOpen, onOpen, onClose } = useDisclosure();
  const form = useForm<CreateBucketSchema>({
    resolver: zodResolver(createBucketSchema),
    defaultValues: { globalAlias: "" },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) form.setFocus("globalAlias");
  }, [isOpen]);

  const createBucket = useCreateBucket({
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      toast.success("Bucket created!");
    },
    onError: handleError,
  });

  const onSubmit = form.handleSubmit((values) => {
    createBucket.mutate(values);
  });

  return (
    <>
      <Button icon={Plus} color="primary" onClick={onOpen}>
        Create Bucket
      </Button>

      <Modal ref={dialogRef} backdrop open={isOpen}>
        <Modal.Header className="mb-1">Create New Bucket</Modal.Header>
        <Modal.Body>
          <p>Enter the details of the bucket you wish to create.</p>

          <form onSubmit={onSubmit}>
            <InputField form={form} name="globalAlias" title="Bucket Name" />
          </form>
        </Modal.Body>

        <Modal.Actions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            disabled={createBucket.isPending}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default CreateBucketDialog;
