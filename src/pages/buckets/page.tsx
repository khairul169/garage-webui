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
    let buckets =
      data?.map((bucket) => {
        return {
          ...bucket,
          aliases: [
            ...(bucket.globalAliases || []),
            ...(bucket.localAliases?.map((l) => l.alias) || []),
          ],
        };
      }) || [];

    if (search?.length > 0) {
      const q = search.toLowerCase();
      buckets = buckets.filter(
        (bucket) =>
          bucket.id.includes(q) ||
          bucket.aliases.find((alias) => alias.includes(q))
      );
    }

    buckets = buckets.sort((a, b) => a.aliases[0].localeCompare(b.aliases[0]));

    return buckets;
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
