import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { forwardRef } from "react";
import { Button } from "react-daisyui";

type Props = React.ComponentPropsWithoutRef<"div"> & {
  onClick?: () => void;
  onRemove?: () => void;
};

const Chips = forwardRef<HTMLDivElement, Props>(
  ({ className, children, onRemove, onClick, ...props }, ref) => {
    const commonProps = {
      ref: ref as never,
      className: cn(
        "inline-flex flex-row items-center h-8 px-4 rounded-full text-sm border border-primary/80 text-base-content cursor-default",
        className
      ),
    };

    if (onClick) {
      return (
        <button
          {...commonProps}
          onClick={onClick}
          {...(props as React.ComponentPropsWithoutRef<"button">)}
        >
          {children}
          {onRemove ? (
            <Button
              color="ghost"
              shape="circle"
              size="sm"
              className="-mr-3"
              onClick={onRemove}
            >
              <X size={16} />
            </Button>
          ) : null}
        </button>
      );
    }

    return (
      <div
        {...commonProps}
        {...props}
      >
        {children}
        {onRemove ? (
          <Button
            color="ghost"
            shape="circle"
            size="sm"
            className="-mr-3"
            onClick={onRemove}
          >
            <X size={16} />
          </Button>
        ) : null}
      </div>
    );
  }
);

export default Chips;
