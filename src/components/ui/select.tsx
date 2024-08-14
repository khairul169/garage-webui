import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import BaseSelect from "react-select";
import Creatable from "react-select/creatable";

type Props = ComponentPropsWithoutRef<typeof BaseSelect> & {
  creatable?: boolean;
  onCreateOption?: (inputValue: string) => void;
};

const Select = ({ creatable, ...props }: Props) => {
  const Comp = creatable ? Creatable : BaseSelect;

  return (
    <Comp
      unstyled
      classNames={{
        control: (p) =>
          cn(
            "bg-base-100 px-4 rounded-btn border text-base-content border-base-content/20 h-12",
            p.isMulti && "py-2 flex flex-row gap-2 items-center flex-wrap",
            p.isMulti && p.hasValue ? "pt-1 px-2 h-auto" : null
          ),
        input: () => "text-base-content",
        menuList: () =>
          "bg-base-100 rounded-btn border border-base-content/20 p-0",
        noOptionsMessage: () => "my-4",
        option: (p) =>
          cn(
            "text-base-content bg-base-100 hover:bg-base-300 px-4 py-3 !cursor-pointer",
            p.isSelected || p.isFocused ? "bg-base-200" : null
          ),
        singleValue: () => "text-base-content",
        multiValue: () =>
          "bg-base-300/80 text-base-content/80 pl-2 mt-1 mr-1 flex flex-row items-center",
        multiValueRemove: () =>
          "px-2 py-2 hover:bg-primary hover:text-primary-content",
      }}
      noOptionsMessage={() =>
        creatable ? "Type something to add..." : undefined
      }
      {...props}
    />
  );
};

export default Select;
