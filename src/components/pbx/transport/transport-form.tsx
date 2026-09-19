"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transport } from "@/lib/api/transports";

const transportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  protocol: z.enum(["udp", "tcp", "ws", "wss", "tls"]),
  bind: z.string().min(1, "Bind address is required"),
  localNet: z.string().optional(),
});

export type TransportFormData = z.infer<typeof transportSchema>;

interface TransportFormProps {
  initialData?: Partial<Transport>;
  onSubmit: (data: TransportFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransportForm({ initialData, onSubmit, onCancel, isLoading }: TransportFormProps) {
  const form = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      name: initialData?.name || "",
      protocol: initialData?.protocol || "udp",
      bind: initialData?.bind || "0.0.0.0:5060",
      localNet: initialData?.localNet || "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Transport Name</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g. transport-udp" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="protocol">Protocol</Label>
            <Select 
              value={form.watch("protocol")} 
              onValueChange={(val: any) => form.setValue("protocol", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="udp">UDP</SelectItem>
                <SelectItem value="tcp">TCP</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ws">WS</SelectItem>
                <SelectItem value="wss">WSS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bind">Bind Address:Port</Label>
            <Input id="bind" {...form.register("bind")} placeholder="e.g. 0.0.0.0:5060" />
            {form.formState.errors.bind && (
              <p className="text-sm text-destructive">{form.formState.errors.bind.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="localNet">Local Network (Optional)</Label>
            <Input id="localNet" {...form.register("localNet")} placeholder="e.g. 192.168.1.0/24" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Transport"}
        </Button>
      </div>
    </form>
  );
}
