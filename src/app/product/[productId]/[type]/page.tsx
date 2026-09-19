"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pjsipObjectApi, PjsipObject, PjsipObjectType } from "@/lib/api/pjsip-objects";
import { productApi } from "@/lib/api/products";
import { useServerContext } from "@/lib/contexts/server-context";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Box, Save } from "lucide-react";
import { useState, use, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const objectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50),
  inherits: z.string().optional(),
  fields: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
  })),
});

type ObjectFormData = z.infer<typeof objectSchema>;

export default function ProductObjectPage({ params }: { params: Promise<{ productId: string; type: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.productId;
  const type = resolvedParams.type as PjsipObjectType;
  
  const { activeServer } = useServerContext();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<PjsipObject | null>(null);

  const { data: products } = useQuery({
    queryKey: ["products", activeServer?.id],
    queryFn: () => productApi.getProducts(activeServer!.id),
    enabled: !!activeServer,
  });
  
  const product = products?.find(p => p.id === productId);

  const { data: allProductObjects, isLoading } = useQuery({
    queryKey: ["pjsip-objects", productId],
    queryFn: () => pjsipObjectApi.getObjects(productId),
  });

  const { data: transports } = useQuery({
    queryKey: ["transports", activeServer?.id],
    queryFn: () => import("@/lib/api/transports").then(m => m.transportApi.getTransports()).then(d => d.filter(t => t.serverId === activeServer?.id)),
    enabled: !!activeServer,
  });

  const objects = allProductObjects?.filter(o => o.type === type) || [];
  const authObjects = allProductObjects?.filter(o => o.type === "auth") || [];
  const aorObjects = allProductObjects?.filter(o => o.type === "aor") || [];
  const endpointObjects = allProductObjects?.filter(o => o.type === "endpoint") || [];
  const { data: serverTemplates } = useQuery({
    queryKey: ["server-templates", activeServer?.id, type],
    queryFn: () => pjsipObjectApi.getTemplatesForServer(activeServer!.id, type),
    enabled: !!activeServer,
  });

  const form = useForm<ObjectFormData>({
    resolver: zodResolver(objectSchema),
    defaultValues: { name: "", inherits: "", fields: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields"
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<PjsipObject, "id">) => pjsipObjectApi.createObject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pjsip-objects", productId, type] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; update: Partial<PjsipObject> }) => pjsipObjectApi.updateObject(data.id, data.update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pjsip-objects", productId, type] });
      setIsDialogOpen(false);
      setEditingObject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: pjsipObjectApi.deleteObject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pjsip-objects", productId, type] }),
  });

  const handleEdit = (obj: PjsipObject) => {
    setEditingObject(obj);
    form.reset({
      id: obj.id,
      name: obj.name,
      inherits: obj.inherits || "",
      fields: obj.fields,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingObject(null);
    form.reset({ name: "", inherits: "", fields: [] });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ObjectFormData) => {
    if (editingObject) {
      updateMutation.mutate({ 
        id: editingObject.id, 
        update: { 
          name: data.name, 
          inherits: data.inherits, 
          fields: data.fields 
        } 
      });
    } else {
      createMutation.mutate({ 
        productId, 
        type, 
        name: data.name, 
        inherits: data.inherits, 
        fields: data.fields 
      });
    }
  };

  if (!activeServer) return null;

  const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Box className="mr-3 h-8 w-8 text-primary" />
              {type} Builder
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure {type} objects for {product?.name || "Engine"}.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add {typeDisplay}
          </Button>
        </div>

        <div className="border rounded-md mt-6 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Object Name</TableHead>
                <TableHead>Fields Count</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading objects...</TableCell>
                </TableRow>
              ) : objects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No {type} objects found.</TableCell>
                </TableRow>
              ) : (
                objects?.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell className="font-mono text-primary font-bold">[{obj.name}]</TableCell>
                    <TableCell>{obj.fields.length} properties</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate">
                      {obj.fields.map(f => `${f.key}=${f.value}`).join(", ")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(obj)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(obj.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingObject ? "Edit" : "Create"} {typeDisplay} Object</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name">Object Name (without brackets)</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. 1001 or voip-trunk-auth" className="font-mono" />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <Label>Key-Value Properties</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Field
                  </Button>
                </div>

                <div className="flex flex-col space-y-4 mb-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="inherits">Inherits From (Template)</Label>
                    <Controller
                      control={form.control}
                      name="inherits"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <SelectTrigger id="inherits" className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {serverTemplates?.map(t => (
                              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">Select a global Server Template to inherit properties from.</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const watchKey = form.watch(`fields.${index}.key`);
                    
                    let options: string[] | null = null;
                    if (watchKey === "transport") options = transports?.map(t => t.name) || [];
                    else if (watchKey === "auth" || watchKey === "outbound_auth") options = authObjects.map(o => o.name);
                    else if (watchKey === "aors") options = aorObjects.map(o => o.name);
                    else if (watchKey === "endpoint") options = endpointObjects.map(o => o.name);

                    return (
                      <div key={field.id} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input {...form.register(`fields.${index}.key` as const)} placeholder="Key (e.g. transport)" className="font-mono text-sm" />
                          {form.formState.errors.fields?.[index]?.key && <p className="text-[10px] text-destructive">{form.formState.errors.fields[index]?.key?.message}</p>}
                        </div>
                        <span className="text-muted-foreground font-mono">=</span>
                        <div className="flex-1">
                          {options !== null ? (
                            <Controller
                              control={form.control}
                              name={`fields.${index}.value` as const}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <SelectTrigger className="font-mono text-sm w-full">
                                    <SelectValue placeholder={`Select ${watchKey}...`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {options!.map(opt => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          ) : (
                            <Input {...form.register(`fields.${index}.value` as const)} placeholder="Value (e.g. transport-udp)" className="font-mono text-sm" />
                          )}
                          {form.formState.errors.fields?.[index]?.value && <p className="text-[10px] text-destructive">{form.formState.errors.fields[index]?.value?.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4 border rounded border-dashed">No fields added.</p>
                  )}
                </div>
              </div>
            </form>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Object"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
