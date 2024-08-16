import Page from "@/context/page-context";
import { useClusterStatus } from "./hooks";
import { Card } from "react-daisyui";
import NodesList from "./components/nodes-list";

const ClusterPage = () => {
  const { data } = useClusterStatus();

  return (
    <div className="container">
      <Page title="Cluster" />

      <Card>
        <Card.Body className="gap-1">
          <Card.Title className="mb-2">Details</Card.Title>

          <DetailItem title="Node ID" value={data?.node} />
          <DetailItem title="Version" value={data?.garageVersion} />
          {/* <DetailItem title="Rust version" value={data?.rustVersion} /> */}
          <DetailItem title="DB engine" value={data?.dbEngine} />
          <DetailItem title="Layout version" value={data?.layoutVersion} />
        </Card.Body>
      </Card>

      <Card className="mt-4 md:mt-8">
        <Card.Body>
          <Card.Title>Nodes</Card.Title>

          <NodesList nodes={data?.nodes || []} />
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
