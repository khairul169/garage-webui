import { Alert, Card, Modal } from "react-daisyui";
import Button from "@/components/ui/button";
import { CheckCircle, CircleXIcon, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useBucketContext } from "../context";
import { bucketCorsSchema, BucketCorsSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm, UseFormReturn } from "react-hook-form";
import Input, { InputField } from "@/components/ui/input";
import FormControl from "@/components/ui/form-control";
import { useDisclosure } from "@/hooks/useDisclosure";
import Chips from "@/components/ui/chips";
import { useBucketCorsMutation } from "../hooks";
import { handleError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const CorsConfiguration = () => {
  const queryClient = useQueryClient();
  const { bucketName, cors, bucket } = useBucketContext();

  const { mutate, isPending } = useBucketCorsMutation({
    onSuccess: () => {
      toast.success("CORS saved!");
      queryClient.invalidateQueries({ queryKey: ["bucket_cors", bucketName] });
    },
    onError: handleError,
  });

  const form = useForm<BucketCorsSchema>({
    resolver: zodResolver(bucketCorsSchema),
    defaultValues: {
      bucketName: bucketName,
      rules: cors,
    },
  });

  const fields = form.watch("rules");

  function handleSubmit(data: BucketCorsSchema) {
    mutate(data);
  }

  const allowConfiguration = bucket.keys.some((key) => key.permissions.owner);

  return (
    <Card className="card-body">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-row items-center gap-2">
          <Card.Title className="flex-1 truncate">
            Cors Configuration
          </Card.Title>
          <Button
            icon={CheckCircle}
            color="primary"
            type="submit"
            disabled={isPending || !allowConfiguration}
          >
            Save
          </Button>
        </div>
        {!allowConfiguration && (
          <Alert status="warning" icon={<CircleXIcon />} className="mt-5">
            <span>
              You must configure an access key with owner permissions for this
              bucket before setting up CORS.
            </span>
          </Alert>
        )}
        {allowConfiguration &&
          fields.map((_, idx) => (
            <div
              className="grid md:grid-cols-2 xl:grid-cols-5 gap-5 mt-5"
              key={idx}
            >
              <FormControl
                form={form}
                name={`rules.${idx}.allowedHeaders`}
                title={"Allowed Headers"}
                render={(field) => (
                  <CorsRulesChips
                    form={form}
                    fieldName={`rules.${idx}.allowedHeaders`}
                    values={(field.value as string[]) ?? []}
                  />
                )}
              />
              <FormControl
                form={form}
                name={`rules.${idx}.allowedMethods`}
                title={"Allowed Methods"}
                render={(field) => (
                  <CorsRulesChips
                    form={form}
                    fieldName={`rules.${idx}.allowedMethods`}
                    values={(field.value as string[]) ?? []}
                  />
                )}
              />
              <FormControl
                form={form}
                name={`rules.${idx}.allowedOrigins`}
                title={"Allowed Origins"}
                render={(field) => (
                  <CorsRulesChips
                    form={form}
                    fieldName={`rules.${idx}.allowedOrigins`}
                    values={(field.value as string[]) ?? []}
                  />
                )}
              />
              <FormControl
                form={form}
                name={`rules.${idx}.exposeHeaders`}
                title={"Expose Headers"}
                render={(field) => (
                  <CorsRulesChips
                    form={form}
                    fieldName={`rules.${idx}.exposeHeaders`}
                    values={(field.value as string[]) ?? []}
                  />
                )}
              />
              <InputField
                form={form}
                name={`rules.${idx}.maxAgeSeconds`}
                title="Max age seconds"
                placeholder="0000"
                type="number"
              />
            </div>
          ))}
      </form>
    </Card>
  );
};

interface CorsRulesChipsProps {
  form: UseFormReturn<BucketCorsSchema>;
  fieldName: Path<BucketCorsSchema>;
  values: string[];
}

function CorsRulesChips({ fieldName, form, values }: CorsRulesChipsProps) {
  function onRemove(value: string) {
    const currentValues =
      (form.getValues(fieldName as Path<BucketCorsSchema>) as string[]) ?? [];

    form.setValue(
      fieldName,
      currentValues.filter((v) => v !== value)
    );
  }
  return (
    <div className="flex flex-row flex-wrap gap-2 mt-2">
      {values.map((value) => (
        <Chips key={value} onRemove={() => onRemove(value)}>
          {value}
        </Chips>
      ))}
      <AddRuleDialog form={form} fieldName={fieldName} />
    </div>
  );
}

interface AddRuleDialogProps {
  form: UseFormReturn<BucketCorsSchema>;
  fieldName: Path<BucketCorsSchema>;
}

const AddRuleDialog = ({ form, fieldName }: AddRuleDialogProps) => {
  const { dialogRef, isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = "";
    }
  }, [isOpen]);

  function onSubmit() {
    const value = inputRef.current?.value?.trim();
    if (!value) {
      onClose();
      return;
    }

    const currentValues =
      (form.getValues(fieldName as Path<BucketCorsSchema>) as string[]) ?? [];

    form.setValue(
      fieldName as Path<BucketCorsSchema>,
      [...currentValues, value],
      { shouldDirty: true, shouldValidate: true }
    );

    onClose();
  }

  return (
    <>
      <Button type="button" size="sm" onClick={onOpen} icon={Plus}>
        Add Rule
      </Button>

      <Modal ref={dialogRef} open={isOpen}>
        <Modal.Header>Add Alias</Modal.Header>

        <Modal.Body>
          <Input ref={inputRef} className="w-full" />
        </Modal.Body>

        <Modal.Actions>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" color="primary" onClick={onSubmit}>
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default CorsConfiguration;
