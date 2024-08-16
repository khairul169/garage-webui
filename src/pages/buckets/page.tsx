import Page from "@/context/page-context";
import { useBuckets } from "./hooks";
import { Input } from "react-daisyui";
import BucketCard from "./components/bucket-card";
import CreateBucketDialog from "./components/create-bucket-dialog";
import { useMemo, useState } from "react";

const BucketsPage = () => {
  const { data } = useBuckets();
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    if (!search?.length) {
      return data;
    }

    const q = search.toLowerCase();
    return data?.filter(
      (bucket) =>
        bucket.id.includes(q) ||
        bucket.globalAliases.find((alias) => alias.includes(q))
    );
  }, [data, search]);

  return (
    <div className="container">
      <Page title="Buckets" />

      <div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex-1" />
          <CreateBucketDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-stretch mt-4 md:mt-8">
          {items?.map((bucket) => (
            <BucketCard key={bucket.id} data={bucket} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BucketsPage;
