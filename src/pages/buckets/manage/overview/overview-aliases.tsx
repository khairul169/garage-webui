import { Modal } from "react-daisyui";
import { Plus } from "lucide-react";
import Chips from "@/components/ui/chips";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddAliasSchema, addAliasSchema } from "../schema";
import Button from "@/components/ui/button";
import { useAddAlias, useRemoveAlias } from "../hooks";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { InputField } from "@/components/ui/input";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBucketContext } from "../context";

const AliasesSection = () => {
  const { bucket: data } = useBucketContext();

  const queryClient = useQueryClient();
  const removeAlias = useRemoveAlias(data?.id, {
    onSuccess: () => {
      toast.success("Alias removed!");
      queryClient.invalidateQueries({ queryKey: ["bucket", data?.id] });
    },
    onError: handleError,
  });

  const onRemoveAlias = (alias: string) => {
    if (window.confirm("Are you sure you want to remove this alias?")) {
      removeAlias.mutate(alias);
    }
  };

  const aliases = data?.globalAliases || [];

  return (
    <div className="mt-2">
      <p className="inline label label-text">Aliases</p>

      <div className="flex flex-row flex-wrap gap-2 mt-2">
        {aliases.map((alias: string) => (
          <Chips key={alias} onRemove={() => onRemoveAlias(alias)}>
            {alias}
          </Chips>
        ))}
        <AddAliasDialog id={data?.id} />
      </div>
    </div>
  );
};

const AddAliasDialog = ({ id }: { id?: string }) => {
  const { dialogRef, isOpen, onOpen, onClose } = useDisclosure();
  const form = useForm<AddAliasSchema>({
    resolver: zodResolver(addAliasSchema),
    defaultValues: { alias: "" },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) form.setFocus("alias");
  }, [isOpen]);

  const addAlias = useAddAlias(id, {
    onSuccess: () => {
      form.reset();
      onClose();
      toast.success("Alias added!");
      queryClient.invalidateQueries({ queryKey: ["bucket", id] });
    },
    onError: handleError,
  });

  const onSubmit = form.handleSubmit((values) => {
    addAlias.mutate(values.alias);
  });

  return (
    <>
      <Button size="sm" onClick={onOpen} icon={Plus}>
        Add Alias
      </Button>

      <Modal ref={dialogRef} open={isOpen}>
        <Modal.Header>Add Alias</Modal.Header>

        <Modal.Body>
          <form onSubmit={onSubmit}>
            <InputField form={form} name="alias" title="Name" />
          </form>
        </Modal.Body>

        <Modal.Actions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            onClick={onSubmit}
            disabled={addAlias.isPending}
          >
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default AliasesSection;
