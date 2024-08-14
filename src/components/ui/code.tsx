import { cn } from "@/lib/utils";
import React from "react";

type Props = React.ComponentPropsWithoutRef<"code">;

const Code = ({ className, ...props }: Props) => {
  return (
    <code
      className={cn(
        "border border-base-content/20 px-4 py-3 rounded-lg font-mono block",
        className
      )}
      {...props}
    />
  );
};

export default Code;
