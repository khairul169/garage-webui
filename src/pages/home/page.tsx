import Page from "@/context/page-context";
import { useNodesHealth } from "./hooks";
import StatsCard from "./components/stats-card";
import {
  Database,
  DatabaseZap,
  FileBox,
  FileCheck,
  FileClock,
  HardDrive,
  HardDriveUpload,
  Leaf,
  PieChart,
} from "lucide-react";
import { cn, readableBytes, ucfirst } from "@/lib/utils";
import { useBuckets } from "../buckets/hooks";
import { useMemo } from "react";

const HomePage = () => {
  const { data: health } = useNodesHealth();
  const { data: buckets } = useBuckets();

  const totalUsage = useMemo(() => {
    return buckets?.reduce((acc, bucket) => acc + bucket.bytes, 0);
  }, [buckets]);

  return (
    <div className="container">
      <Page title="Dashboard" />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Status"
          icon={Leaf}
          value={ucfirst(health?.status)}
          valueClassName={cn(
            "text-lg",
            health?.status === "healthy"
              ? "text-success"
              : health?.status === "degraded"
              ? "text-warning"
              : "text-error"
          )}
        />
        <StatsCard title="Nodes" icon={HardDrive} value={health?.knownNodes} />
        <StatsCard
          title="Connected Nodes"
          icon={HardDriveUpload}
          value={health?.connectedNodes}
        />
        <StatsCard
          title="Storage Nodes"
          icon={Database}
          value={health?.storageNodes}
        />
        <StatsCard
          title="Active Storage Nodes"
          icon={DatabaseZap}
          value={health?.storageNodesOk}
        />
        <StatsCard
          title="Partitions"
          icon={FileBox}
          value={health?.partitions}
        />
        <StatsCard
          title="Partitions Quorum"
          icon={FileClock}
          value={health?.partitionsQuorum}
        />
        <StatsCard
          title="Active Partitions"
          icon={FileCheck}
          value={health?.partitionsAllOk}
        />
        <StatsCard
          title="Total Usage"
          icon={PieChart}
          value={readableBytes(totalUsage)}
        />
      </section>
    </div>
  );
};

export default HomePage;
