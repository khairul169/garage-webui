import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import {
  FieldValues,
  UseFormReturn,
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  FieldPath,
  UseFormStateReturn,
} from "react-hook-form";

type FormControlProps<
  T extends FieldValues,
  U extends FieldPath<T> = FieldPath<T>
> = ComponentPropsWithoutRef<"div"> & {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  title?: string;

  render: (
    field: ControllerRenderProps<T, U>,
    fieldProps: {
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<T>;
    }
  ) => React.ReactElement;
};

const FormControl = <T extends FieldValues>({
  form,
  name,
  title,
  className,
  render,
}: FormControlProps<T>) => {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState, formState }) => (
        <div className={cn("form-control", className)}>
          {title ? <label className="label label-text">{title}</label> : null}

          {render(field, { fieldState, formState })}

          {fieldState.error ? (
            <label className="label label-text text-error">
              {fieldState.error.message}
            </label>
          ) : null}
        </div>
      )}
    />
  );
};

export default FormControl;
