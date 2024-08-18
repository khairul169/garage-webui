import { useParams } from "react-router-dom";
import { Card } from "react-daisyui";

import ObjectList from "./object-list";
import { useBucket } from "../hooks";
import { useState } from "react";
import ObjectListNavigator from "./object-list-navigator";
import {
  EllipsisVertical,
  FilePlus,
  FolderPlus,
  UploadIcon,
} from "lucide-react";
import Button from "@/components/ui/button";

const BrowseTab = () => {
  const { id } = useParams();
  const { data: bucket } = useBucket(id);

  const [curPrefix, setCurPrefix] = useState(-1);
  const [prefixHistory, setPrefixHistory] = useState<string[]>([]);
  const bucketName = bucket?.globalAliases[0];

  const gotoPrefix = (prefix: string) => {
    const history = prefixHistory.slice(0, curPrefix + 1);
    setPrefixHistory([...history, prefix]);
    setCurPrefix(history.length);
  };

  if (!bucket) {
    return null;
  }

  if (!bucket.keys.find((k) => k.permissions.read && k.permissions.write)) {
    return (
      <div className="p-4 min-h-[200px] flex flex-col justify-center">
        <p className="text-center">
          You need to add a key to your bucket to be able to browse it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <ObjectListNavigator
          bucketName={bucketName}
          curPrefix={curPrefix}
          setCurPrefix={setCurPrefix}
          prefixHistory={prefixHistory}
          actions={
            <>
              <Button icon={FolderPlus} color="ghost" />
              <Button icon={FilePlus} color="ghost" />
              <Button icon={UploadIcon} color="ghost" />
              <Button icon={EllipsisVertical} color="ghost" />
            </>
          }
        />

        {bucketName ? (
          <ObjectList
            bucket={bucketName}
            prefix={prefixHistory[curPrefix] || ""}
            onPrefixChange={gotoPrefix}
          />
        ) : null}
      </Card>
    </div>
  );
};

export default BrowseTab;
