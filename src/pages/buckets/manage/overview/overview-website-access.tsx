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
import { ToggleField } from "@/components/ui/toggle";
import { useBucketContext } from "../context";

const WebsiteAccessSection = () => {
  const { bucket: data, bucketName } = useBucketContext();
  const { data: config } = useConfig();
  const form = useForm<WebsiteConfigSchema>({
    resolver: zodResolver(websiteConfigSchema),
    defaultValues: {
      websiteAccess: false,
      indexDocument: "index.html",
      errorDocument: "error/400.html",
    },
  });
  const isEnabled = useWatch({ control: form.control, name: "websiteAccess" });

  const websitePort = config?.s3_web?.bind_addr?.split(":").pop() || "80";
  const rootDomain = config?.s3_web?.root_domain;

  const updateMutation = useUpdateBucket(data?.id);

  const handleChange = useDebounce((values: DeepPartial<WebsiteConfigSchema>) => {
    const websiteData = {
      enabled: values.websiteAccess,
      indexDocument: values.websiteAccess
        ? values.indexDocument
        : undefined,
      errorDocument: values.websiteAccess
        ? values.errorDocument
        : undefined,
    };

    updateMutation.mutate({
      websiteAccess: {
        enabled: values.websiteAccess ?? false,
        indexDocument: values.websiteAccess
          ? websiteData.indexDocument ?? "index.html"
          : null,
        errorDocument: values.websiteAccess
          ? websiteData.errorDocument ?? "error/400.html"
          : null,
      }
    });
  });

  // Reset form when data changes without triggering watch
  useEffect(() => {
    if (!data) return;

    form.reset({
      websiteAccess: data?.websiteAccess ?? false,
      indexDocument: data?.websiteConfig?.indexDocument || "index.html",
      errorDocument: data?.websiteConfig?.errorDocument || "error/400.html",
    }, { keepDirty: false });
  }, [data, form]);

  // Set up form watcher
  useEffect(() => {
    const subscription = form.watch(handleChange);
    return () => subscription.unsubscribe();
  }, [form, handleChange]);

  return (
    <div className="mt-8">
      <div className="flex flex-row gap-2">
        <p className="label label-text py-0 grow-0">Website Access</p>
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

      <ToggleField form={form} name="websiteAccess" label="Enabled" />

      {isEnabled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              form={form}
              name="indexDocument"
              title="Index Document"
            />
            <InputField
              form={form}
              name="errorDocument"
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
