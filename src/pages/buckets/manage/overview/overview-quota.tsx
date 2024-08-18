import { DeepPartial, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuotaSchema, quotaSchema } from "../schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUpdateBucket } from "../hooks";
import { InputField } from "@/components/ui/input";
import { ToggleField } from "@/components/ui/toggle";
import { useBucketContext } from "../context";

const QuotaSection = () => {
  const { bucket: data } = useBucketContext();

  const form = useForm<QuotaSchema>({
    resolver: zodResolver(quotaSchema),
  });
  const isEnabled = useWatch({ control: form.control, name: "enabled" });

  const updateMutation = useUpdateBucket(data?.id);

  const onChange = useDebounce((values: DeepPartial<QuotaSchema>) => {
    const { enabled } = values;
    const maxObjects = Number(values.maxObjects);
    const maxSize = Math.round(Number(values.maxSize) * 1024 ** 3);

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
      maxSize: data?.quotas?.maxSize ? data?.quotas?.maxSize / 1024 ** 3 : null,
      maxObjects: data?.quotas?.maxObjects || null,
    });

    const { unsubscribe } = form.watch((values) => onChange(values));
    return unsubscribe;
  }, [data]);

  return (
    <div className="mt-8">
      <ToggleField form={form} name="enabled" title="Quotas" label="Enabled" />

      {isEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            form={form}
            name="maxObjects"
            title="Max Objects"
            type="number"
          />

          <InputField
            form={form}
            name="maxSize"
            title="Max Size (GB)"
            type="number"
          />
        </div>
      )}
    </div>
  );
};

export default QuotaSection;
