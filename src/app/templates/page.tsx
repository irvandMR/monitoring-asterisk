"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pjsipObjectApi, PjsipObject, PjsipObjectType } from "@/lib/api/pjsip-objects";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Box, Save, Copy } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const objectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["endpoint", "auth", "aor", "identify", "registration"]),
  fields: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
  })),
});

type ObjectFormData = z.infer<typeof objectSchema>;

export default function TemplatesPage() {
  const { activeServer } = useServerContext();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<PjsipObject | null>(null);
  const [activeTab, setActiveTab] = useState<PjsipObjectType>("endpoint");

  const { data: serverTemplates, isLoading } = useQuery({
    queryKey: ["server-templates", activeServer?.id],
    queryFn: () => pjsipObjectApi.getTemplatesForServer(activeServer!.id),
    enabled: !!activeServer,
  });

  const templates = serverTemplates?.filter(t => t.type === activeTab) || [];

  const form = useForm<ObjectFormData>({
    resolver: zodResolver(objectSchema),
    defaultValues: { name: "", type: "endpoint", fields: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const createMutation = useMutation({
    mutationFn: (data: ObjectFormData) => pjsipObjectApi.createObject({
      serverId: activeServer!.id,
      productId: undefined, // It's a server template, no product
      type: data.type,
      name: data.name,
      isTemplate: true,
      fields: data.fields
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-templates", activeServer?.id] });
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, update }: { id: string, update: Partial<PjsipObject> }) => pjsipObjectApi.updateObject(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-templates", activeServer?.id] });
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pjsipObjectApi.deleteObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-templates", activeServer?.id] });
    }
  });

  const handleEdit = (obj: PjsipObject) => {
    setEditingObject(obj);
    form.reset({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      fields: obj.fields,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingObject(null);
    form.reset({ name: "", type: activeTab, fields: [] });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ObjectFormData) => {
    if (editingObject) {
      updateMutation.mutate({ 
        id: editingObject.id, 
        update: { 
          name: data.name, 
          type: data.type,
          fields: data.fields 
        } 
      });
    } else {
      createMutation.mutate(data);
    }
  };

  if (!activeServer) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-muted-foreground">Please select a server to configure templates.</p>
        </div>
      </PageContainer>
    );
  }

  const tabs: { label: string; value: PjsipObjectType }[] = [
    { label: "Endpoints", value: "endpoint" },
    { label: "Auths", value: "auth" },
    { label: "AORs", value: "aor" },
    { label: "Identifies", value: "identify" },
    { label: "Registrations", value: "registration" },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Copy className="mr-3 h-8 w-8 text-primary" />
              Global Templates
            </h1>
            <p className="text-muted-foreground mt-2">
              Create blueprints <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">(!)</code> that can be inherited by objects across all Engines on {activeServer.name}.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>

        <div className="flex space-x-2 border-b border-border mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="text-muted-foreground">Loading templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed bg-secondary/10">
            <Copy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No {activeTab} templates found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create a template to reuse configurations across multiple engines.
            </p>
            <Button onClick={handleCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((obj) => (
              <div key={obj.id} className="group flex flex-col border border-border rounded-lg bg-card overflow-hidden hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between p-3 bg-secondary/30 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-primary">[{obj.name}](!)</span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(obj)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(obj.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 flex-1 overflow-auto max-h-[200px]">
                  <table className="w-full text-xs font-mono">
                    <tbody>
                      <tr>
                        <td className="text-muted-foreground pr-4 py-1 align-top">type</td>
                        <td className="text-foreground py-1 break-all">={obj.type}</td>
                      </tr>
                      {obj.fields.map((f, i) => (
                        <tr key={i}>
                          <td className="text-muted-foreground pr-4 py-1 align-top">{f.key}</td>
                          <td className="text-foreground py-1 break-all">={f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingObject ? "Edit Template" : "Create New Template"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground font-mono mr-1">[</span>
                  <Input id="name" {...form.register("name")} placeholder="e.g. webrtc-template" className="font-mono" />
                  <span className="text-primary font-mono ml-1 font-bold">](!)</span>
                </div>
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editingObject}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tabs.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Template Properties (Key-Value)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Property
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input {...form.register(`fields.${index}.key` as const)} placeholder="Key (e.g. transport)" className="font-mono text-sm" />
                    </div>
                    <span className="text-muted-foreground font-mono">=</span>
                    <div className="flex-1">
                      <Input {...form.register(`fields.${index}.value` as const)} placeholder="Value (e.g. transport-wss)" className="font-mono text-sm" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4 border rounded border-dashed">No properties added yet.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {editingObject ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
