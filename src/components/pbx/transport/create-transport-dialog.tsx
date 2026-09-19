"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TransportForm, TransportFormData } from "./transport-form";
import { useState } from "react";
import { transportApi } from "@/lib/api/transports";
import { useQueryClient } from "@tanstack/react-query";
import { useServerContext } from "@/lib/contexts/server-context";

interface CreateTransportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTransportDialog({ open, onOpenChange }: CreateTransportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { activeServer } = useServerContext();

  const onSubmit = async (data: TransportFormData) => {
    if (!activeServer) return;
    setIsLoading(true);
    try {
      await transportApi.createTransport({ ...data, serverId: activeServer.id });
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create transport:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Transport</DialogTitle>
          <DialogDescription>
            Define a new SIP transport for {activeServer?.name}.
          </DialogDescription>
        </DialogHeader>
        <TransportForm 
          onSubmit={onSubmit} 
          onCancel={() => onOpenChange(false)} 
          isLoading={isLoading} 
        />
      </DialogContent>
    </Dialog>
  );
}
