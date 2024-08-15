import { Bucket } from "../types";
import { ArchiveIcon, ChartPie, ChartScatter } from "lucide-react";
import { readableBytes } from "@/lib/utils";
import Button from "@/components/ui/button";

type Props = {
  data: Bucket;
};

const BucketCard = ({ data }: Props) => {
  return (
    <div className="card card-body p-6">
      <div className="flex flex-row items-start gap-4 p-2 pb-0">
        <ArchiveIcon size={28} />

        <div className="flex-1">
          <p className="text-xl font-medium">
            {data.globalAliases?.join(", ")}
          </p>
        </div>

        <div className="flex-1">
          <p className="text-sm flex items-center gap-1">
            <ChartPie className="inline" size={16} />
            Usage
          </p>
          <p className="text-2xl font-medium">{readableBytes(data.bytes)}</p>
        </div>

        <div className="flex-1">
          <p className="text-sm flex items-center gap-1">
            <ChartScatter className="inline" size={16} />
            Objects
          </p>
          <p className="text-2xl font-medium">{data.objects}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-row justify-end gap-4">
        <Button href={`/buckets/${data.id}`}>Manage</Button>
        {/* <Button color="primary">Browse</Button> */}
      </div>
    </div>
  );
};

export default BucketCard;
