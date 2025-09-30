import { Button, Checkbox, Input, Modal, Select } from "react-daisyui";
import { useAssignNode, useClusterLayout, useClusterStatus } from "../hooks";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AssignNodeSchema,
  assignNodeSchema,
  capacityUnits,
  calculateCapacity,
  parseCapacity,
} from "../schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { assignNodeDialog } from "../stores";
import FormControl from "@/components/ui/form-control";
import Select2 from "@/components/ui/select";

const defaultValues: AssignNodeSchema = {
  nodeId: "",
  zone: "",
  capacity: 1,
  capacityUnit: "GB",
  isGateway: false,
  tags: [],
  zoneRedundancyType: "atLeast",
  zoneRedundancyAtLeast: 1,
};

const AssignNodeDialog = () => {
  const { isOpen, data } = assignNodeDialog.use();
  const { data: cluster } = useClusterStatus();
  const { data: layout } = useClusterLayout();
  const queryClient = useQueryClient();

  const form = useForm<AssignNodeSchema>({
    resolver: zodResolver(assignNodeSchema),
    defaultValues,
  });
  const isGateway = useWatch({ control: form.control, name: "isGateway" });
  const zoneRedundancyType = useWatch({
    control: form.control,
    name: "zoneRedundancyType",
  });

  const assignNode = useAssignNode({
    onSuccess() {
      form.reset();
      toast.success("Node staged for assignment!");
      queryClient.invalidateQueries({ queryKey: ["status"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
      assignNodeDialog.close();
    },
    onError(err) {
      toast.error(err?.message || "Unknown error");
    },
  });

  useEffect(() => {
    if (data) {
      const isGateway = data.capacity === null;
      const cap = parseCapacity(data.capacity);

      form.reset({
        ...defaultValues,
        ...data,
        capacity: cap.value,
        capacityUnit: cap.unit,
        isGateway,
      });
    }
  }, [data, form]);

  const zoneList = useMemo(() => {
    const nodes = cluster?.nodes || cluster?.knownNodes || [];
    const list = nodes
      .flatMap((i) => {
        const role = layout?.roles.find((role) => role.id === i.id);
        const staged = layout?.stagedRoleChanges.find(
          (role) => role.id === i.id
        );
        return staged?.zone || role?.zone || i.role?.zone;
      })
      .filter(Boolean);

    return [...new Set(list)].map((zone) => ({
      label: zone,
      value: zone,
    }));
  }, [cluster, layout]);

  const tagsList = useMemo(() => {
    const nodes = cluster?.nodes || cluster?.knownNodes || [];
    const list = nodes
      .flatMap((i) => {
        const role = layout?.roles.find((role) => role.id === i.id);
        const staged = layout?.stagedRoleChanges.find(
          (role) => role.id === i.id
        );
        return staged?.tags || role?.tags || i.role?.tags;
      })
      .filter(Boolean);

    return [...new Set(list)].map((tag) => ({
      label: tag,
      value: tag,
    }));
  }, [cluster, layout]);

  const onSubmit = form.handleSubmit((values) => {
    const capacity = !values.isGateway
      ? calculateCapacity(values.capacity, values.capacityUnit)
      : null;
    const data = {
      parameters: {
        zoneRedundancy:
          values.zoneRedundancyType === "maximum"
            ? ("maximum" as const)
            : { atLeast: Number(values.zoneRedundancyAtLeast) },
      },
      roles: [
        {
          id: values.nodeId,
          zone: values.zone,
          capacity,
          tags: values.tags,
        },
      ],
    };
    assignNode.mutate(data);
  });

  return (
    <Modal open={isOpen}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <Modal.Header>Assign Node</Modal.Header>
        <Modal.Body>
          <div className="form-control">
            <label className="label label-text">Node ID:</label>
            <Input
              placeholder="..."
              className="w-full"
              {...form.register("nodeId")}
              readOnly
            />
          </div>

          <FormControl
            form={form}
            name="zone"
            title="Zone"
            className="mt-2"
            render={(field) => (
              <Select2
                creatable
                {...field}
                value={
                  field.value
                    ? { label: field.value, value: field.value }
                    : null
                }
                options={zoneList}
                onChange={(newValue) => {
                  const value = newValue as { value: string } | null;
                  field.onChange(value?.value || null);
                }}
              />
            )}
          />

          <div className="flex items-center justify-between mt-2">
            <label className="label label-text flex-1 truncate">Capacity</label>
            <label className="label label-text cursor-pointer">
              <Controller
                control={form.control}
                name="isGateway"
                render={({ field }) => (
                  <Checkbox
                    name={field.name}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mr-2"
                  />
                )}
              />
              Gateway
            </label>
          </div>

          {!isGateway && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormControl
                form={form}
                name="capacity"
                render={(field) => <Input type="number" name={field.name} value={String(field.value || '')} onChange={field.onChange} />}
              />
              <FormControl
                form={form}
                name="capacityUnit"
                render={(field) => (
                  <Select name={field.name} value={String(field.value || '')} onChange={field.onChange}>
                    <option value="">Select Unit</option>

                    {capacityUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}

          <FormControl
            form={form}
            name="tags"
            title="Tags"
            className="mt-2"
            render={(field) => (
              <Select2
                creatable
                isMulti
                {...field}
                value={
                  field.value
                    ? (field.value as string[]).map((value) => ({
                      label: value,
                      value,
                    }))
                    : null
                }
                options={tagsList}
                onChange={(values) => {
                  if (Array.isArray(values)) {
                    field.onChange(values.map((value) => value.value));
                  }
                }}
              />
            )}
          />

          <FormControl
            form={form}
            name="zoneRedundancyType"
            title="Zone Redundancy"
            render={(field) => (
              <Select
                name={field.name}
                value={String(field.value || "")}
                onChange={field.onChange}
              >
                <option value="atLeast">At Least</option>
                <option value="maximum">Maximum</option>
              </Select>
            )}
          />

          {zoneRedundancyType === "atLeast" && (
            <FormControl
              form={form}
              name="zoneRedundancyAtLeast"
              title="Minimum Zones"
              className="mt-2"
              render={(field) => (
                <Input
                  type="number"
                  name={field.name}
                  value={String(field.value || "")}
                  onChange={field.onChange}
                />
              )}
            />
          )}
        </Modal.Body>
        <Modal.Actions>
          <Button type="button" onClick={assignNodeDialog.close}>
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={assignNode.isPending}>
            Save
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default AssignNodeDialog;
