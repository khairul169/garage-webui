import Page from "@/context/page-context";
import { useClusterStatus, useNodeInfo } from "./hooks";
import { Card } from "react-daisyui";
import NodesList from "./components/nodes-list";
import { useMemo } from "react";

const ClusterPage = () => {
  const { data } = useClusterStatus();
  const { data: node } = useNodeInfo();

  const nodes = useMemo(() => {
    if (!data) return [];

    if (Array.isArray(data.knownNodes)) {
      return data.knownNodes.map((node) => ({
        ...node,
        role: data.layout?.roles.find((role) => role.id === node.id),
      }));
    }

    return data.nodes || [];
  }, [data]);

  return (
    <div className="container">
      <Page title="Cluster" />

      <Card>
        <Card.Body className="gap-1">
          <Card.Title className="mb-2">Details</Card.Title>

          {/* <DetailItem title="Node ID" value={node?.nodeId} /> */}
          <DetailItem title="Garage Version" value={node?.garageVersion} />
          {/* <DetailItem title="Rust version" value={data?.rustVersion} /> */}
          <DetailItem title="DB engine" value={node?.dbEngine} />
          <DetailItem
            title="Layout version"
            value={data?.layoutVersion || data?.layout?.version || "-"}
          />
        </Card.Body>
      </Card>

      <Card className="mt-4 md:mt-8">
        <Card.Body>
          <Card.Title>Nodes</Card.Title>

          <NodesList nodes={nodes} />
        </Card.Body>
      </Card>
    </div>
  );
};

type DetailItemProps = {
  title: string;
  value?: string | number | null;
};

const DetailItem = ({ title, value }: DetailItemProps) => {
  return (
    <div className="flex flex-row items-start max-w-xl gap-3 text-left text-sm">
      <div className="shrink-0 w-1/3 max-w-[200px]">
        <p className="text-base-content/80">{title}</p>
      </div>
      <div className="flex-1 truncate">
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
};

export default ClusterPage;
