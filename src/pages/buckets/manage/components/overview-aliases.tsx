import { Button } from "react-daisyui";
import { Plus } from "lucide-react";
import Chips from "@/components/ui/chips";
import { Bucket } from "../../types";

type Props = {
  data?: Bucket;
};

const AliasesSection = ({ data }: Props) => {
  const aliases = data?.globalAliases?.slice(1);

  return (
    <div className="mt-2">
      <p className="inline label label-text">Aliases</p>

      <div className="flex flex-row flex-wrap gap-2 mt-1">
        {aliases?.map((alias: string) => (
          <Chips key={alias} onRemove={() => {}}>
            {alias}
          </Chips>
        ))}
        <Button size="sm">
          <Plus className="-ml-1" size={18} />
          Add Alias
        </Button>
      </div>
    </div>
  );
};

export default AliasesSection;
