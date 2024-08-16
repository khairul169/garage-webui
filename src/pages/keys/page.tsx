import Button from "@/components/ui/button";
import Page from "@/context/page-context";
import { Trash } from "lucide-react";
import { Card, Input, Table } from "react-daisyui";
import { useKeys, useRemoveKey } from "./hooks";
import CreateKeyDialog from "./components/create-key-dialog";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";

const KeysPage = () => {
  const { data, refetch } = useKeys();

  const removeKey = useRemoveKey({
    onSuccess: () => {
      refetch();
      toast.success("Key removed!");
    },
    onError: handleError,
  });

  const onRemove = (id: string) => {
    if (window.confirm("Are you sure you want to remove this key?")) {
      removeKey.mutate(id);
    }
  };

  return (
    <div className="container">
      <Page title="Keys" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input placeholder="Search..." />
        <div className="flex-1" />
        <CreateKeyDialog />
      </div>

      <Card className="card-body mt-4 md:mt-8 p-4">
        <div className="w-full overflow-x-auto">
          <Table zebra>
            <Table.Head>
              <span>#</span>
              <span>Key ID</span>
              <span>Name</span>
              <span />
            </Table.Head>

            <Table.Body>
              {data?.map((key, idx) => (
                <Table.Row key={key.id}>
                  <span>{idx + 1}</span>
                  <span className="truncate">{key.id}</span>
                  <span>{key.name}</span>
                  <span>
                    <Button
                      color="ghost"
                      icon={Trash}
                      onClick={() => onRemove(key.id)}
                    />
                  </span>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default KeysPage;
