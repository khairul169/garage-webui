import Page from "@/context/page-context";
import { useBuckets } from "./hooks";
import { Button, Input } from "react-daisyui";
import { Plus } from "lucide-react";
import BucketCard from "./components/bucket-card";

const BucketsPage = () => {
  const { data } = useBuckets();

  return (
    <div className="container">
      <Page title="Buckets" />

      <div>
        <div className="flex flex-row items-center gap-2">
          <Input placeholder="Search..." />
          <div className="flex-1" />
          <Button color="primary">
            <Plus />
            Create Bucket
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-stretch mt-4 md:mt-8">
          {data?.map((bucket) => (
            <BucketCard key={bucket.id} data={bucket} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BucketsPage;
