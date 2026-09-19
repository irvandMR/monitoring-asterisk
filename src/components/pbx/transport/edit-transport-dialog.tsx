"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TransportForm, TransportFormData } from "./transport-form";
import { useState } from "react";
import { transportApi, Transport } from "@/lib/api/transports";
import { useQueryClient } from "@tanstack/react-query";

interface EditTransportDialogProps {
  transport: Transport | null;
  onOpenChange: (open: boolean) => void;
}

export function EditTransportDialog({ transport, onOpenChange }: EditTransportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (data: TransportFormData) => {
    if (!transport) return;
    setIsLoading(true);
    try {
      await transportApi.updateTransport(transport.id, data);
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update transport:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!transport} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Transport</DialogTitle>
          <DialogDescription>
            Update configuration for {transport?.name}.
          </DialogDescription>
        </DialogHeader>
        {transport && (
          <TransportForm 
            initialData={transport}
            onSubmit={onSubmit} 
            onCancel={() => onOpenChange(false)} 
            isLoading={isLoading} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
