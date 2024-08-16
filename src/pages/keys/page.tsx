import Button from "@/components/ui/button";
import Page from "@/context/page-context";
import { Copy, Eye, Trash } from "lucide-react";
import { Card, Input, Table } from "react-daisyui";
import { useKeys, useRemoveKey } from "./hooks";
import CreateKeyDialog from "./components/create-key-dialog";
import { toast } from "sonner";
import { copyToClipboard, handleError } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import api from "@/lib/api";

const KeysPage = () => {
  const { data, refetch } = useKeys();
  const [search, setSearch] = useState("");
  const [secretKeys, setSecretKeys] = useState<Record<string, string>>({});

  const removeKey = useRemoveKey({
    onSuccess: () => {
      refetch();
      toast.success("Key removed!");
    },
    onError: handleError,
  });

  const fetchSecretKey = useCallback(async (id: string) => {
    try {
      const result = await api.get("/v1/key", {
        params: { id, showSecretKey: "true" },
      });
      if (!result?.secretAccessKey) {
        throw new Error("Failed to fetch secret key");
      }
      setSecretKeys((prev) => ({ ...prev, [id]: result.secretAccessKey }));
    } catch (err) {
      handleError(err);
    }
  }, []);

  const onRemove = (id: string) => {
    if (window.confirm("Are you sure you want to remove this key?")) {
      removeKey.mutate(id);
    }
  };

  const items = useMemo(() => {
    if (!search?.length) {
      return data;
    }

    const q = search.toLowerCase();
    return data?.filter((item) => item.id.includes(q) || item.name.includes(q));
  }, [data, search]);

  return (
    <div className="container">
      <Page title="Keys" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1" />
        <CreateKeyDialog />
      </div>

      <Card className="card-body mt-4 md:mt-8 p-4">
        <div className="w-full overflow-x-auto">
          <Table zebra>
            <Table.Head>
              <span>#</span>
              <span>Name</span>
              <span>Key ID</span>
              <span>Secret Key</span>
              <span />
            </Table.Head>

            <Table.Body>
              {items?.map((key, idx) => (
                <Table.Row key={key.id}>
                  <span>{idx + 1}</span>
                  <span>{key.name}</span>
                  <div className="flex flex-row items-center">
                    <p className="truncate max-w-20" title={key.id}>
                      {key.id}
                    </p>
                    <Button
                      size="sm"
                      icon={Copy}
                      onClick={() => copyToClipboard(key.id)}
                    />
                  </div>
                  {!secretKeys[key.id] ? (
                    <Button
                      icon={Eye}
                      size="sm"
                      onClick={() => fetchSecretKey(key.id)}
                    >
                      View
                    </Button>
                  ) : (
                    <div className="flex flex-row items-center">
                      <p
                        className="font-mono max-w-20 truncate"
                        title={secretKeys[key.id]}
                      >
                        {secretKeys[key.id]}
                      </p>
                      <Button
                        size="sm"
                        icon={Copy}
                        onClick={() => copyToClipboard(secretKeys[key.id])}
                      />
                    </div>
                  )}

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
