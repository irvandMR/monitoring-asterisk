"use client";

import { PageContainer } from "@/components/layout/page-container";
import { TransportsTab } from "@/components/pbx/transport/transports-tab";
import { Network } from "lucide-react";

export default function TransportsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Network className="mr-3 h-8 w-8 text-primary" />
            Transports
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure server-wide PJSIP transports (UDP, TCP, WSS).
          </p>
        </div>
        
        <div className="mt-4">
          <TransportsTab />
        </div>
      </div>
    </PageContainer>
  );
}
