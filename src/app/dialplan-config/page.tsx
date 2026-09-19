"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
import { useQuery } from "@tanstack/react-query";
import { routingApi } from "@/lib/api/routing";
import { productApi } from "@/lib/api/products";

export default function DialplanConfigPage() {
  const { activeServer } = useServerContext();

  const { data: products } = useQuery({
    queryKey: ["products", activeServer?.id],
    queryFn: () => productApi.getProducts(activeServer!.id),
    enabled: !!activeServer,
  });

  const productIds = products?.map(p => p.id) || [];

  const { data: dialplans } = useQuery({
    queryKey: ["all-routing", productIds],
    queryFn: () => routingApi.getAllDialplansForServer(productIds),
    enabled: productIds.length > 0,
  });

  const extensionsConfigPreview = `
; ==============================================================================
; Auto-generated extensions.conf for ${activeServer?.name}
; ==============================================================================

[general]
static=yes
writeprotect=no

[globals]

; ------------------------------------------------------------------------------
; ENGINE DIALPLANS
; ------------------------------------------------------------------------------
${products?.map(p => {
  const dp = dialplans?.find(d => d.productId === p.id);
  if (!dp || !dp.content) return "";
  return `; --- ${p.name.toUpperCase()} ---\n${dp.content}\n\n`;
}).join("") || "; No dialplans defined yet."}
`.trim();

  if (!activeServer) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-muted-foreground">Please select a server to view its configuration.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6 h-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dialplan Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Generated <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">extensions.conf</code> for {activeServer.name}.
          </p>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 border border-border rounded-md bg-[#1e1e1e] p-4 overflow-hidden">
          <pre className="text-xs font-mono text-amber-400 overflow-auto flex-1 whitespace-pre-wrap">
            {extensionsConfigPreview}
          </pre>
        </div>
      </div>
    </PageContainer>
  );
}
