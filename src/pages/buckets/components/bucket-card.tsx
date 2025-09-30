import { Bucket } from "../types";
import { ArchiveIcon, ChartPie, ChartScatter } from "lucide-react";
import { readableBytes } from "@/lib/utils";
import Button from "@/components/ui/button";
import { useBucketDetails } from "../hooks";

type Props = {
  data: Bucket & { aliases: string[] };
};

const BucketCard = ({ data }: Props) => {
  const { data: bucketDetails } = useBucketDetails(data.id);

  // Use detailed data if available, otherwise fall back to basic data
  const bytes = bucketDetails?.bytes ?? data.bytes;
  const objects = bucketDetails?.objects ?? data.objects;

  return (
    <div className="card card-body p-6">
      <div className="grid grid-cols-2 items-start gap-4 p-2 pb-0">
        <div className="flex flex-row items-start gap-x-3 col-span-2">
          <ArchiveIcon size={28} className="shrink-0" />

          <p className="text-xl font-medium truncate">
            {data.aliases?.join(", ")}
          </p>
        </div>

        <div>
          <p className="text-sm flex items-center gap-1">
            <ChartPie className="inline" size={16} />
            Usage
          </p>
          <p className="text-xl font-medium mt-1">
            {bytes != null ? readableBytes(bytes) : "n/a"}
          </p>
        </div>

        <div>
          <p className="text-sm flex items-center gap-1">
            <ChartScatter className="inline" size={16} />
            Objects
          </p>
          <p className="text-xl font-medium mt-1">
            {objects != null ? objects.toLocaleString() : "n/a"}
          </p>
        </div>
      </div>

      <div className="flex flex-row justify-end gap-4">
        <Button href={`/buckets/${data.id}`}>Manage</Button>
        <Button color="primary" href={`/buckets/${data.id}?tab=browse`}>
          Browse
        </Button>
      </div>
    </div>
  );
};

export default BucketCard;
