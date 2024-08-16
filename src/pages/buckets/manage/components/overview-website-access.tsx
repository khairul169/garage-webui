import { Controller, DeepPartial, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { websiteConfigSchema, WebsiteConfigSchema } from "../schema";
import { useEffect } from "react";
import { Input, Toggle } from "react-daisyui";
import FormControl from "@/components/ui/form-control";
import { useDebounce } from "@/hooks/useDebounce";
import { useUpdateBucket } from "../hooks";
import { useConfig } from "@/hooks/useConfig";
import { Info, LinkIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { Bucket } from "../../types";

type Props = {
  data?: Bucket;
};

const WebsiteAccessSection = ({ data }: Props) => {
  const { data: config } = useConfig();
  const form = useForm<WebsiteConfigSchema>({
    resolver: zodResolver(websiteConfigSchema),
  });
  const bucketName = data?.globalAliases[0] || "";
  const isEnabled = useWatch({ control: form.control, name: "websiteAccess" });

  const websitePort = config?.s3_web?.bind_addr?.split(":").pop() || "80";
  const rootDomain = config?.s3_web?.root_domain;

  const updateMutation = useUpdateBucket(data?.id);

  const onChange = useDebounce((values: DeepPartial<WebsiteConfigSchema>) => {
    const data = {
      enabled: values.websiteAccess,
      indexDocument: values.websiteAccess
        ? values.websiteConfig?.indexDocument
        : undefined,
      errorDocument: values.websiteAccess
        ? values.websiteConfig?.errorDocument
        : undefined,
    };

    updateMutation.mutate({
      websiteAccess: data,
    });
  });

  useEffect(() => {
    form.reset({
      websiteAccess: data?.websiteAccess,
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

      <label className="inline-flex label label-text gap-2 cursor-pointer">
        <Controller
          control={form.control}
          name="websiteAccess"
          render={({ field }) => (
            <Toggle {...(field as any)} checked={field.value} />
          )}
        />
        Enabled
      </label>

      {isEnabled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl
              form={form}
              name="websiteConfig.indexDocument"
              title="Index Document"
              render={(field) => (
                <Input {...field} value={String(field.value || "")} />
              )}
            />
            <FormControl
              form={form}
              name="websiteConfig.errorDocument"
              title="Error Document"
              render={(field) => (
                <Input {...field} value={String(field.value || "")} />
              )}
            />
          </div>

          <div className="mt-4 alert flex flex-row flex-wrap">
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
