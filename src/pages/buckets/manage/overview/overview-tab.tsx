import { Card } from "react-daisyui";
import { ChartPie, ChartScatter } from "lucide-react";
import { readableBytes } from "@/lib/utils";
import WebsiteAccessSection from "./overview-website-access";
import AliasesSection from "./overview-aliases";
import QuotaSection from "./overview-quota";
import { useBucketContext } from "../context";

const OverviewTab = () => {
  const { bucket: data } = useBucketContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-start">
      <Card className="card-body gap-0 items-start order-2 md:order-1">
        <Card.Title>Summary</Card.Title>

        <AliasesSection />
        <WebsiteAccessSection />
        <QuotaSection />
      </Card>

      <Card className="card-body order-1 md:order-2">
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
