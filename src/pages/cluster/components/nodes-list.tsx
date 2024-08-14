import { Alert, Badge, Button, Dropdown, Input, Table } from "react-daisyui";
import { Node } from "../types";
import { cn, handleError, readableBytes } from "@/lib/utils";
import {
  Check,
  CheckCircle,
  Cylinder,
  EllipsisVertical,
  Info,
  Network,
  RouteIcon,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import ConnectNodeDialog from "./connect-node-dialog";
import AssignNodeDialog from "./assign-node-dialog";
import { assignNodeDialog } from "../stores";
import {
  useApplyChanges,
  useClusterLayout,
  useRevertChanges,
  useUnassignNode,
} from "../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type NodeListProps = {
  nodes: Node[];
};

const NodesList = ({ nodes }: NodeListProps) => {
  const { data, refetch } = useClusterLayout();
  const [filter, setFilter] = useState({
    search: "",
  });
  const queryClient = useQueryClient();

  const unassignNode = useUnassignNode({
    onSuccess: () => {
      toast.success("Node unassigned!");
      refetch();
    },
    onError: handleError,
  });

  const revertChanges = useRevertChanges({
    onSuccess: () => {
      toast.success("Layout reverted!");
      refetch();
    },
    onError: handleError,
  });

  const applyChanges = useApplyChanges({
    onSuccess: () => {
      toast.success("Layout applied!");
      setTimeout(refetch, 100);
      queryClient.invalidateQueries({ queryKey: ["status"] });
    },
    onError: handleError,
  });

  const items = useMemo(() => {
    return nodes
      .filter((item) => {
        if (filter.search) {
          const q = filter.search.toLowerCase();
          return (
            item.hostname.toLowerCase().includes(q) ||
            item.id.includes(q) ||
            item.addr.includes(q) ||
            item.role?.zone?.includes(q) ||
            item.role?.tags?.find((tag) => tag.toLowerCase().includes(q))
          );
        }

        return true;
      })
      .map((item) => {
        const role = data?.roles?.find((r) => r.id === item.role?.id);
        const stagedChanges = data?.stagedRoleChanges?.find(
          (i) => i.id === item.id
        );
        return {
          ...item,
          role: stagedChanges || role || item.role,
          isStaged: !!stagedChanges,
        };
      });
  }, [nodes, data, filter]);

  const onAssign = (node: Node) => {
    assignNodeDialog.open({
      nodeId: node.id,
      zone: node.role?.zone,
      capacity: node.role?.capacity,
      tags: node.role?.tags,
    });
  };

  const onUnassign = (id: string) => {
    if (window.confirm("Are you sure you want to unassign this node?")) {
      unassignNode.mutate(id);
    }
  };

  const onRevert = () => {
    if (
      window.confirm("Are you sure you want to revert layout changes?") &&
      data?.version != null
    ) {
      revertChanges.mutate(data?.version + 1);
    }
  };

  const onApply = () => {
    if (
      window.confirm("Are you sure you want to revert layout changes?") &&
      data?.version != null
    ) {
      applyChanges.mutate(data?.version + 1);
    }
  };

  const hasStagedChanges = data && data.stagedRoleChanges?.length > 0;

  return (
    <>
      <div className="flex flex-row items-center my-2 gap-4">
        <Input
          placeholder="Search..."
          value={filter.search}
          onChange={(e) => {
            setFilter((state) => ({ ...state, search: e.target.value }));
          }}
        />
        <div className="flex-1" />

        {hasStagedChanges ? (
          <>
            <Button
              onClick={onRevert}
              disabled={revertChanges.isPending || applyChanges.isPending}
            >
              Revert
            </Button>
            <Button
              color="primary"
              onClick={onApply}
              disabled={revertChanges.isPending || applyChanges.isPending}
            >
              <Check />
              Apply
            </Button>
          </>
        ) : (
          <ConnectNodeDialog />
        )}
      </div>

      {hasStagedChanges && (
        <Alert icon={<Info />}>
          There are staged layout changes that need to be applied. Press Apply
          to apply them, or Revert to discard them.
        </Alert>
      )}

      {applyChanges.data?.message ? (
        <Alert
          icon={<CheckCircle />}
          className="items-start overflow-x-auto relative text-sm"
        >
          <pre>{applyChanges.data.message.join("\n")}</pre>
          <Button
            onClick={applyChanges.reset}
            className="absolute right-2 top-2"
            shape="circle"
            size="sm"
          >
            <X />
          </Button>
        </Alert>
      ) : null}

      <div className="w-full overflow-x-auto min-h-[400px] pb-16">
        <Table size="sm">
          <Table.Head>
            <span>#</span>
            <span>ID</span>
            <span>Hostname</span>
            <span>Zone</span>
            <span>Capacity</span>
            <span>Status</span>
            <span />
          </Table.Head>

          <Table.Body>
            {items.map((item, idx) => (
              <Table.Row
                key={item.id}
                className={cn(
                  item.isStaged && "bg-warning/10",
                  item.role && "remove" in item.role ? "bg-error/10" : null
                )}
              >
                <span>{idx + 1}</span>
                <p className="max-w-[80px] truncate" title={item.id}>
                  {item.id}
                </p>
                <>
                  <p className="font-medium">{item.hostname}</p>
                  <div className="flex flex-row items-center gap-1">
                    <Share2 size={12} />
                    <p className="text-base-content/80 text-xs">{item.addr}</p>
                  </div>
                </>
                <>
                  <p>{item.role?.zone || "-"}</p>
                  <div className="flex flex-row items-center flex-wrap gap-1">
                    {item.role?.tags?.map((tag: any) => (
                      <Badge key={tag} color="primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
                <>
                  <p>
                    {item.role?.capacity === null ? (
                      <>
                        <Network className="inline mr-1" size={18} />
                        Gateway
                      </>
                    ) : (
                      readableBytes(item.role?.capacity, 1000)
                    )}
                  </p>

                  {item.role?.capacity !== null && item.dataPartition ? (
                    <div className="flex flex-row items-center gap-1">
                      <Cylinder size={12} />

                      <p className="text-xs text-base-content/80">
                        {readableBytes(item.dataPartition?.available) +
                          ` (${Math.round(
                            (item.dataPartition.available /
                              item.dataPartition.total) *
                              100
                          )}%)`}
                      </p>
                    </div>
                  ) : null}
                </>

                <Badge
                  color={
                    item.draining ? "warning" : item.isUp ? "success" : "error"
                  }
                >
                  {item.draining
                    ? "Draining"
                    : item.isUp
                    ? "Active"
                    : "Inactive"}
                </Badge>

                <Dropdown end>
                  <Dropdown.Toggle button={false}>
                    <Button shape="circle" color="ghost">
                      <EllipsisVertical />
                    </Button>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="min-w-40 gap-y-1">
                    <Dropdown.Item onClick={() => onAssign(item)}>
                      <RouteIcon size={20} /> Assign
                    </Dropdown.Item>
                    {item.role != null && (
                      <Dropdown.Item
                        className="text-error bg-error/10"
                        onClick={() => onUnassign(item.id)}
                      >
                        <Trash2 size={20} /> Remove
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <AssignNodeDialog />
    </>
  );
};

export default NodesList;
