"use client";

import { useQuery } from "@tanstack/react-query";
import { transportApi, Transport } from "@/lib/api/transports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateTransportDialog } from "@/components/pbx/transport/create-transport-dialog";
import { EditTransportDialog } from "@/components/pbx/transport/edit-transport-dialog";
import { DeleteTransportDialog } from "@/components/pbx/transport/delete-transport-dialog";
import { useServerContext } from "@/lib/contexts/server-context";
import { Badge } from "@/components/ui/badge";

export function TransportsTab() {
  const { activeServer } = useServerContext();
  
  const { data: transports, isLoading } = useQuery({
    queryKey: ["transports", activeServer?.id],
    queryFn: () => transportApi.getTransports().then(data => data.filter(t => t.serverId === activeServer?.id)),
    enabled: !!activeServer,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
  const [deletingTransport, setDeletingTransport] = useState<Transport | null>(null);

  return (
    <div className="flex flex-col space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Manage SIP transports for binding Asterisk to specific ports and protocols.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Transport
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Bind Address</TableHead>
              <TableHead>Local Net</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading transports...
                </TableCell>
              </TableRow>
            ) : transports?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transports found. Asterisk PJSIP will fail to start without a transport!
                </TableCell>
              </TableRow>
            ) : (
              transports?.map((trans) => (
                <TableRow key={trans.id}>
                  <TableCell className="font-medium text-primary">{trans.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">{trans.protocol}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{trans.bind}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{trans.localNet || "-"}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTransport(trans)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingTransport(trans)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTransportDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditTransportDialog transport={editingTransport} onOpenChange={(open) => !open && setEditingTransport(null)} />
      <DeleteTransportDialog transport={deletingTransport} onOpenChange={(open) => !open && setDeletingTransport(null)} />
    </div>
  );
}
