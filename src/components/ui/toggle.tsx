import React, { forwardRef } from "react";
import { Toggle as BaseToggle } from "react-daisyui";
import FormControl from "./form-control";
import { FieldValues } from "react-hook-form";

type ToggleProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggle>,
  "form"
> & { label?: string };

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, ...props }, ref) => {
    return (
      <label className="inline-flex justify-start label label-text gap-2 cursor-pointer">
        <BaseToggle ref={ref} {...props} />
        {label}
      </label>
    );
  }
);

type ToggleFieldProps<T extends FieldValues> = Omit<
  React.ComponentPropsWithoutRef<typeof FormControl<T>>,
  "render"
> &
  ToggleProps & {
    inputClassName?: string;
  };

export const ToggleField = <T extends FieldValues>({
  form,
  name,
  title,
  className,
  inputClassName,
  ...props
}: ToggleFieldProps<T>) => {
  return (
    <FormControl
      form={form}
      name={name}
      title={title}
      className={className}
      render={(field) => (
        <Toggle
          {...props}
          {...field}
          className={inputClassName}
          color={field.value ? "primary" : undefined}
          checked={field.value || false}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      )}
    />
  );
};

export default Toggle;
