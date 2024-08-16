import Code from "@/components/ui/code";
import { Button, Input, Modal } from "react-daisyui";
import { useConnectNode } from "../hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectNodeSchema, connectNodeSchema } from "../schema";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plug } from "lucide-react";

const ConnectNodeDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<ConnectNodeSchema>({
    resolver: zodResolver(connectNodeSchema),
    defaultValues: { nodeId: "" },
  });

  const connectNode = useConnectNode({
    onSuccess() {
      form.reset({ nodeId: "" });
      handleHide();
      toast.success("Node connected!");
      queryClient.invalidateQueries({ queryKey: ["status"] });
    },
    onError(err) {
      handleHide();
      toast.error(err?.message || "Unknown error");
    },
  });

  const handleShow = useCallback(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  const handleHide = useCallback(() => {
    dialogRef.current?.close();
  }, [dialogRef]);

  const onSubmit = form.handleSubmit((values) => {
    connectNode.mutate(values.nodeId);
  });

  return (
    <>
      <Button color="primary" onClick={handleShow}>
        <Plug />
        Connect
      </Button>

      <Modal ref={dialogRef} backdrop>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <Modal.Header>Connect Node</Modal.Header>
          <Modal.Body>
            <p>Run this command in your target node to get node id:</p>
            <Code className="mt-2">docker exec garage /garage node id</Code>

            <p className="mt-8">Enter node id:</p>
            <Input
              placeholder="..."
              className="w-full"
              {...form.register("nodeId")}
            />
          </Modal.Body>
          <Modal.Actions>
            <Button type="button" onClick={handleHide}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={connectNode.isPending}
            >
              Save
            </Button>
          </Modal.Actions>
        </form>
      </Modal>
    </>
  );
};

export default ConnectNodeDialog;
