import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { Checkbox as BaseCheckbox } from "react-daisyui";
import FormControl from "./form-control";
import { FieldValues } from "react-hook-form";

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox>,
  "form"
> & {
  label?: string;
  inputClassName?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, inputClassName, ...props }, ref) => {
    return (
      <label
        className={cn(
          "label label-text inline-flex items-center justify-start gap-2 cursor-pointer",
          className
        )}
      >
        <BaseCheckbox
          ref={ref}
          color="primary"
          size="sm"
          className={inputClassName}
          {...props}
        />
        {label}
      </label>
    );
  }
);

type CheckboxFieldProps<T extends FieldValues> = Omit<
  React.ComponentPropsWithoutRef<typeof FormControl<T>>,
  "render"
> &
  CheckboxProps;

export const CheckboxField = <T extends FieldValues>({
  form,
  name,
  ...props
}: CheckboxFieldProps<T>) => {
  return (
    <FormControl
      form={form}
      name={name}
      render={(field) => (
        <Checkbox
          {...props}
          {...field}
          checked={field.value}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      )}
    />
  );
};

export default Checkbox;
