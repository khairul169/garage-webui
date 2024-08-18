import { Table } from "react-daisyui";
import { useBrowseObjects } from "./hooks";
import { dayjs, readableBytes } from "@/lib/utils";
import { Object } from "./types";
import { API_URL } from "@/lib/api";

type Props = {
  bucket: string;
  prefix?: string;
  onPrefixChange?: (prefix: string) => void;
};

const ObjectList = ({ bucket, prefix, onPrefixChange }: Props) => {
  const { data } = useBrowseObjects(bucket, { prefix });

  const onObjectClick = (object: Object) => {
    window.open(
      API_URL + `/browse/${bucket}/${data?.prefix}${object.objectKey}?view=1`,
      "_blank"
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <span>Name</span>
          <span>Size</span>
          <span>Last Modified</span>
        </Table.Head>

        <Table.Body>
          {data?.prefixes.map((prefix) => (
            <Table.Row
              key={prefix}
              className="hover:bg-neutral cursor-pointer"
              role="button"
              onClick={() => onPrefixChange?.(prefix)}
            >
              <span>
                {prefix.substring(0, prefix.lastIndexOf("/")).split("/").pop()}
              </span>
              <span />
              <span />
            </Table.Row>
          ))}

          {data?.objects.map((object) => (
            <Table.Row
              key={object.objectKey}
              className="hover:bg-neutral cursor-pointer"
              role="button"
              onClick={() => onObjectClick(object)}
            >
              <span>{object.objectKey}</span>
              <span>{readableBytes(object.size)}</span>
              <span>{dayjs(object.lastModified).fromNow()}</span>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ObjectList;
