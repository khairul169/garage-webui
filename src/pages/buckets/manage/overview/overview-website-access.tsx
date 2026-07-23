import { DeepPartial, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { websiteConfigSchema, WebsiteConfigSchema } from "../schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUpdateBucket } from "../hooks";
import { useConfig } from "@/hooks/useConfig";
import { Info, LinkIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { useBucketContext } from "../context";
import FormControl from "@/components/ui/form-control";
import Select from "@/components/ui/select";

const accessOptions = [
  { label: "Private (login required)", value: "private" },
  { label: "Anonymous HTTP", value: "anonymous" },
] as const;

const WebsiteAccessSection = () => {
  const { bucket: data, bucketName } = useBucketContext();
  const { data: config } = useConfig();
  const form = useForm<WebsiteConfigSchema>({
    resolver: zodResolver(websiteConfigSchema),
  });
  const accessMode = useWatch({ control: form.control, name: "accessMode" });
  const isAnonymous = accessMode === "anonymous";

  const websitePort = config?.s3_web?.bind_addr?.split(":").pop() || "80";
  const rootDomain = config?.s3_web?.root_domain;

  const updateMutation = useUpdateBucket(data?.id);

  const onChange = useDebounce((values: DeepPartial<WebsiteConfigSchema>) => {
    const websiteAccess = {
      enabled: values.accessMode === "anonymous",
      indexDocument: values.accessMode === "anonymous"
        ? values.websiteConfig?.indexDocument
        : undefined,
      errorDocument: values.accessMode === "anonymous"
        ? values.websiteConfig?.errorDocument
        : undefined,
    };

    updateMutation.mutate({
      websiteAccess,
    });
  });

  useEffect(() => {
    form.reset({
      accessMode: data?.websiteAccess ? "anonymous" : "private",
      websiteConfig: {
        indexDocument: data?.websiteConfig?.indexDocument || "index.html",
        errorDocument: data?.websiteConfig?.errorDocument || "error/400.html",
      },
    });

    const { unsubscribe } = form.watch((values) => onChange(values));
    return unsubscribe;
  }, [data]);

  return (
    <div className="mt-8">
      <div className="flex flex-row gap-2">
        <p className="label label-text py-0 grow-0">HTTP Access</p>
        <Button
          href="https://garagehq.deuxfleurs.fr/documentation/cookbook/exposing-websites"
          target="_blank"
          size="sm"
          shape="circle"
          color="ghost"
        >
          <Info size={16} />
        </Button>
      </div>

      <FormControl
        form={form}
        name="accessMode"
        className="mt-2"
        render={(field) => (
          <Select
            {...field}
            value={accessOptions.find((option) => option.value === field.value)}
            options={accessOptions}
            onChange={(option) =>
              field.onChange(
                (option as { value?: "private" | "anonymous" } | null)?.value
              )
            }
          />
        )}
      />

      {isAnonymous && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              form={form}
              name="websiteConfig.indexDocument"
              title="Index Document"
            />
            <InputField
              form={form}
              name="websiteConfig.errorDocument"
              title="Error Document"
            />
          </div>

          <div className="mt-4 alert flex flex-row flex-wrap text-sm gap-x-2 gap-y-1">
            <a
              href={`http://${bucketName}`}
              className="inline-flex items-center flex-row gap-2 font-medium hover:link"
              target="_blank"
            >
              <LinkIcon size={14} />
              {bucketName}
            </a>
            {rootDomain ? (
              <>
                <a
                  href={`http://${bucketName}${rootDomain}`}
                  className="inline-flex items-center flex-row gap-2 font-medium hover:link"
                  target="_blank"
                >
                  <LinkIcon size={14} />
                  {bucketName + rootDomain}
                </a>
                <a
                  href={`http://${bucketName}${rootDomain}:${websitePort}`}
                  className="inline-flex items-center flex-row gap-2 font-medium hover:link"
                  target="_blank"
                >
                  <LinkIcon size={14} />
                  {bucketName + rootDomain + ":" + websitePort}
                </a>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteAccessSection;
