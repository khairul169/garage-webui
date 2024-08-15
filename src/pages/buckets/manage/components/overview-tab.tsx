import { Card } from "react-daisyui";
import { useParams } from "react-router-dom";
import { useBucket } from "../hooks";
import { ChartPie, ChartScatter } from "lucide-react";
import { readableBytes } from "@/lib/utils";
import WebsiteAccessSection from "./overview-website-access";
import AliasesSection from "./overview-aliases";
import QuotaSection from "./overview-quota";

const OverviewTab = () => {
  const { id } = useParams();
  const { data } = useBucket(id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
      <Card className="card-body gap-0 items-start">
        <Card.Title>Summary</Card.Title>

        <AliasesSection data={data} />
        <WebsiteAccessSection data={data} />
        <QuotaSection data={data} />
      </Card>

      <Card className="card-body">
        <Card.Title>Usage</Card.Title>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-row gap-3">
            <ChartPie className="mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm flex items-center gap-1">Storage</p>
              <p className="text-2xl font-medium">
                {readableBytes(data?.bytes)}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <ChartScatter className="mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm flex items-center gap-1">Objects</p>
              <p className="text-2xl font-medium">{data?.objects}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
