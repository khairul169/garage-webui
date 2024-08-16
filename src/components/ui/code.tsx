import { cn, copyToClipboard } from "@/lib/utils";
import React from "react";
import Button from "./button";
import { Copy } from "lucide-react";

type Props = Omit<React.ComponentPropsWithoutRef<"code">, "children"> & {
  children?: string;
};

const Code = ({ className, children, ...props }: Props) => {
  return (
    <code
      className={cn(
        "border border-base-content/20 px-4 py-3 rounded-lg font-mono block relative",
        className
      )}
      {...props}
    >
      {children}
      <Button
        icon={Copy}
        className="absolute right-0 top-0"
        color="ghost"
        onClick={() => copyToClipboard(children || "")}
      />
    </code>
  );
};

export default Code;
