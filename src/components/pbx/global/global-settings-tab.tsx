"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { globalApi, GlobalSettings } from "@/lib/api/global";
import { useServerContext } from "@/lib/contexts/server-context";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save } from "lucide-react";
import { useEffect } from "react";

const globalSchema = z.object({
  use_q850_reason: z.boolean(),
  debug: z.boolean(),
  allowoverlap: z.boolean(),
  bindaddr: z.string().min(1, "Bind address is required"),
  external_media_address: z.string().optional(),
  external_signaling_address: z.string().optional(),
  local_net: z.string().optional(),
  customFields: z.array(z.object({
    key: z.string().min(1, "Key required"),
    value: z.string().min(1, "Value required")
  })).optional(),
});

type GlobalFormData = z.infer<typeof globalSchema>;

export function GlobalSettingsTab() {
  const { activeServer } = useServerContext();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["global-settings", activeServer?.id],
    queryFn: () => globalApi.getSettings(activeServer!.id),
    enabled: !!activeServer,
  });

  const form = useForm<GlobalFormData>({
    resolver: zodResolver(globalSchema),
    defaultValues: {
      use_q850_reason: true,
      debug: false,
      allowoverlap: false,
      bindaddr: "0.0.0.0",
      external_media_address: "",
      external_signaling_address: "",
      local_net: "",
      customFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields"
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (data: GlobalFormData) => globalApi.updateSettings(activeServer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-settings", activeServer?.id] });
    },
  });

  const onSubmit = (data: GlobalFormData) => {
    mutation.mutate(data);
  };

  if (!activeServer) return null;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="flex flex-col space-y-6 pt-4 max-w-3xl">
      <div>
        <p className="text-sm text-muted-foreground">Configure global [global] and [system] PJSIP parameters for {activeServer.name}.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-md bg-card p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Network Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bindaddr">Bind Address</Label>
                <Input id="bindaddr" {...form.register("bindaddr")} placeholder="e.g. 0.0.0.0" />
                {form.formState.errors.bindaddr && (
                  <p className="text-sm text-destructive">{form.formState.errors.bindaddr.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="local_net">Local Net</Label>
                <Input id="local_net" {...form.register("local_net")} placeholder="e.g. 172.18.0.0/18" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="external_media_address">External Media Address</Label>
                <Input id="external_media_address" {...form.register("external_media_address")} placeholder="e.g. 8.215.76.108" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_signaling_address">External Signaling Address</Label>
                <Input id="external_signaling_address" {...form.register("external_signaling_address")} placeholder="e.g. 8.215.76.108" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium border-b pb-2">System Options</h3>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="use_q850_reason" checked={form.watch("use_q850_reason")} onCheckedChange={(val: boolean) => form.setValue("use_q850_reason", val)} />
                <Label htmlFor="use_q850_reason">Use Q.850 Reason (use_q850_reason=yes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="allowoverlap" checked={form.watch("allowoverlap")} onCheckedChange={(val: boolean) => form.setValue("allowoverlap", val)} />
                <Label htmlFor="allowoverlap">Allow Overlap (allowoverlap=yes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="debug" checked={form.watch("debug")} onCheckedChange={(val: boolean) => form.setValue("debug", val)} />
                <Label htmlFor="debug">Enable Debugging (debug=yes)</Label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-medium">Custom Parameters</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                <Plus className="h-4 w-4 mr-2" /> Add Field
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Input {...form.register(`customFields.${index}.key` as const)} placeholder="e.g. max_forwards" />
                  <Input {...form.register(`customFields.${index}.value` as const)} placeholder="e.g. 70" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground py-2 italic">
                  No custom parameters added.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save Global Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
