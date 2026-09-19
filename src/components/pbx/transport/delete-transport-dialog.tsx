"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { transportApi, Transport } from "@/lib/api/transports";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

interface DeleteTransportDialogProps {
  transport: Transport | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransportDialog({ transport, onOpenChange }: DeleteTransportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const onDelete = async () => {
    if (!transport) return;
    setIsLoading(true);
    try {
      await transportApi.deleteTransport(transport.id);
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete transport:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!transport} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Delete Transport
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground">
            Are you sure you want to delete transport <strong>{transport?.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 text-sm text-muted-foreground">
          Warning: If endpoints or trunks are still using this transport, their connections will fail.
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Transport"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
