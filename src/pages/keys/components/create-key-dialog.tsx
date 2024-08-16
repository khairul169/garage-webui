import Button from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Modal } from "react-daisyui";
import { useForm, useWatch } from "react-hook-form";
import { useDisclosure } from "@/hooks/useDisclosure";
import { createKeySchema, CreateKeySchema } from "../schema";
import { InputField } from "@/components/ui/input";
import { CheckboxField } from "@/components/ui/checkbox";
import { useCreateKey } from "../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";

const CreateKeyDialog = () => {
  const { dialogRef, isOpen, onOpen, onClose } = useDisclosure();
  const form = useForm<CreateKeySchema>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: "" },
  });
  const isImport = useWatch({ control: form.control, name: "isImport" });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) form.setFocus("name");
  }, [isOpen]);

  const createKey = useCreateKey({
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries({ queryKey: ["keys"] });
      toast.success("Key created!");
    },
    onError: handleError,
  });

  const onSubmit = form.handleSubmit((values) => {
    createKey.mutate(values);
  });

  return (
    <>
      <Button icon={Plus} color="primary" onClick={onOpen}>
        Create Key
      </Button>

      <Modal ref={dialogRef} backdrop open={isOpen}>
        <Modal.Header className="mb-1">Create New Key</Modal.Header>
        <Modal.Body>
          <p>Enter the details of the key you wish to create.</p>

          <form onSubmit={onSubmit}>
            <InputField form={form} name="name" title="Key Name" />
            <CheckboxField
              form={form}
              name="isImport"
              label="Import existing"
              className="mt-2"
            />

            {isImport && (
              <>
                <InputField
                  form={form}
                  name="accessKeyId"
                  title="Access Key ID"
                />
                <InputField
                  form={form}
                  name="secretAccessKey"
                  title="Secret Access Key"
                />
              </>
            )}
          </form>
        </Modal.Body>

        <Modal.Actions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            disabled={createKey.isPending}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default CreateKeyDialog;
