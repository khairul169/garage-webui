import React, { forwardRef } from "react";
import { Input as BaseInput } from "react-daisyui";
import FormControl from "./form-control";
import { FieldValues } from "react-hook-form";

type InputProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseInput>,
  "form"
>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
  return <BaseInput ref={ref} {...props} />;
});

type InputFieldProps<T extends FieldValues> = Omit<
  React.ComponentPropsWithoutRef<typeof FormControl<T>>,
  "render"
> &
  InputProps & {
    inputClassName?: string;
  };

export const InputField = <T extends FieldValues>({
  form,
  name,
  title,
  className,
  inputClassName,
  ...props
}: InputFieldProps<T>) => {
  return (
    <FormControl
      form={form}
      name={name}
      title={title}
      className={className}
      render={(field) => (
        <Input {...props} {...field} className={inputClassName} />
      )}
    />
  );
};

export default Input;
