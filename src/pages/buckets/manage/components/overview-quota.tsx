import { Controller, DeepPartial, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuotaSchema, quotaSchema } from "../schema";
import { useEffect } from "react";
import { Input, Toggle } from "react-daisyui";
import FormControl from "@/components/ui/form-control";
import { useDebounce } from "@/hooks/useDebounce";
import { useUpdateBucket } from "../hooks";
import { Bucket } from "../../types";

type Props = {
  data?: Bucket;
};

const QuotaSection = ({ data }: Props) => {
  const form = useForm<QuotaSchema>({
    resolver: zodResolver(quotaSchema),
  });
  const isEnabled = useWatch({ control: form.control, name: "enabled" });

  const updateMutation = useUpdateBucket(data?.id);

  const onChange = useDebounce((values: DeepPartial<QuotaSchema>) => {
    const { enabled } = values;
    const maxObjects = Number(values.maxObjects);
    const maxSize = Math.round(Number(values.maxSize) * 1024 * 1024);

    const data = {
      maxObjects: enabled && maxObjects > 0 ? maxObjects : null,
      maxSize: enabled && maxSize > 0 ? maxSize : null,
    };

    updateMutation.mutate({ quotas: data });
  });

  useEffect(() => {
    form.reset({
      enabled:
        data?.quotas?.maxSize != null || data?.quotas?.maxObjects != null,
      maxSize: data?.quotas?.maxSize
        ? data?.quotas?.maxSize / 1024 / 1024
        : null,
      maxObjects: data?.quotas?.maxObjects || null,
    });

    const { unsubscribe } = form.watch((values) => onChange(values));
    return unsubscribe;
  }, [data]);

  return (
    <div className="mt-8">
      <p className="label label-text py-0">Quotas</p>

      <label className="inline-flex label label-text gap-2 cursor-pointer">
        <Controller
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <Toggle {...(field as any)} checked={field.value} />
          )}
        />
        Enabled
      </label>

      {isEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl
            form={form}
            name="maxObjects"
            title="Max Objects"
            render={(field) => (
              <Input
                {...field}
                type="number"
                value={String(field.value || "")}
              />
            )}
          />
          <FormControl
            form={form}
            name="maxSize"
            title="Max Size (GB)"
            render={(field) => (
              <Input
                {...field}
                type="number"
                value={String(field.value || "")}
              />
            )}
          />
        </div>
      )}
    </div>
  );
};

export default QuotaSection;
