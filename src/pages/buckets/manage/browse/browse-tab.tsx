import { useSearchParams } from "react-router-dom";
import { Card } from "react-daisyui";

import ObjectList from "./object-list";
import { useEffect, useState } from "react";
import ObjectListNavigator from "./object-list-navigator";
import Actions from "./actions";
import { useBucketContext } from "../context";
import ShareDialog from "./share-dialog";

const getInitialPrefixes = (searchParams: URLSearchParams) => {
  const prefix = searchParams.get("prefix");
  if (prefix) {
    const paths = prefix.split("/").filter((p) => p);
    return paths.map((_, i) => paths.slice(0, i + 1).join("/") + "/");
  }
  return [];
};

const BrowseTab = () => {
  const { bucket } = useBucketContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prefixHistory, setPrefixHistory] = useState<string[]>(
    getInitialPrefixes(searchParams)
  );
  const [curPrefix, setCurPrefix] = useState(prefixHistory.length - 1);

  useEffect(() => {
    const prefix = prefixHistory[curPrefix] || "";
    const newParams = new URLSearchParams(searchParams);
    newParams.set("prefix", prefix);
    setSearchParams(newParams);
  }, [curPrefix]);

  const gotoPrefix = (prefix: string) => {
    const history = prefixHistory.slice(0, curPrefix + 1);
    setPrefixHistory([...history, prefix]);
    setCurPrefix(history.length);
  };

  if (!bucket.keys.find((k) => k.permissions.read && k.permissions.write)) {
    return (
      <div className="p-4 min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-center max-w-sm">
          You need to add a key with read & write access to your bucket to be
          able to browse it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Card className="pb-2">
        <ObjectListNavigator
          curPrefix={curPrefix}
          setCurPrefix={setCurPrefix}
          prefixHistory={prefixHistory}
          actions={<Actions prefix={prefixHistory[curPrefix] || ""} />}
        />

        <ObjectList
          prefix={prefixHistory[curPrefix] || ""}
          onPrefixChange={gotoPrefix}
        />

        <ShareDialog />
      </Card>
    </div>
  );
};

export default BrowseTab;
