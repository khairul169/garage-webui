import Page from "@/context/page-context";
import { useBuckets } from "./hooks";
import { Input } from "react-daisyui";
import BucketCard from "./components/bucket-card";
import CreateBucketDialog from "./components/create-bucket-dialog";

const BucketsPage = () => {
  const { data } = useBuckets();

  return (
    <div className="container">
      <Page title="Buckets" />

      <div>
        <div className="flex flex-row items-center gap-2">
          <Input placeholder="Search..." />
          <div className="flex-1" />
          <CreateBucketDialog />
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
