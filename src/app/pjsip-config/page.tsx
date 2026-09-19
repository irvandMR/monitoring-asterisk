"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
import { useQuery } from "@tanstack/react-query";
import { pjsipObjectApi } from "@/lib/api/pjsip-objects";
import { productApi } from "@/lib/api/products";
import { globalApi } from "@/lib/api/global";

export default function PjsipConfigPage() {
  const { activeServer } = useServerContext();

  const { data: globalSettings } = useQuery({
    queryKey: ["global-settings", activeServer?.id],
    queryFn: () => globalApi.getSettings(activeServer!.id),
    enabled: !!activeServer,
  });

  const { data: transports } = useQuery({
    queryKey: ["transports", activeServer?.id],
    queryFn: () => import("@/lib/api/transports").then(m => m.transportApi.getTransports()).then(d => d.filter(t => t.serverId === activeServer?.id)),
    enabled: !!activeServer,
  });

  const { data: products } = useQuery({
    queryKey: ["products", activeServer?.id],
    queryFn: () => productApi.getProducts(activeServer!.id),
    enabled: !!activeServer,
  });

  const productIds = products?.map(p => p.id) || [];

  const { data: objects } = useQuery({
    queryKey: ["all-pjsip-objects", productIds],
    queryFn: () => pjsipObjectApi.getAllObjectsForServer(productIds, activeServer?.id),
    enabled: productIds.length > 0,
  });

  // Advanced PJSIP Generator
  const pjsipConfigPreview = `
; ==============================================================================
; Auto-generated pjsip.conf for ${activeServer?.name}
; ==============================================================================

[global]
type=global
${globalSettings?.use_q850_reason ? "use_q850_reason=yes" : "use_q850_reason=no"}
${globalSettings?.debug ? "debug=yes" : "debug=no"}

[system]
type=system
${globalSettings?.allowoverlap ? "allowoverlap=yes" : "allowoverlap=no"}
${globalSettings?.bindaddr ? `bindaddr=${globalSettings.bindaddr}` : ""}
${globalSettings?.local_net ? `local_net=${globalSettings.local_net}` : ""}
${globalSettings?.external_media_address ? `external_media_address=${globalSettings.external_media_address}` : ""}
${globalSettings?.external_signaling_address ? `external_signaling_address=${globalSettings.external_signaling_address}` : ""}
${globalSettings?.customFields?.map(f => `${f.key}=${f.value}`).join("\n") || ""}

; ==============================================================================
; TRANSPORTS
; ==============================================================================
${transports?.map(t => `
[${t.name}]
type=transport
protocol=${t.protocol}
bind=${t.bind}
${t.localNet ? `local_net=${t.localNet}` : ""}
`).join("")}

; ==============================================================================
; GLOBAL TEMPLATES
; ==============================================================================
${objects?.filter(o => o.isTemplate && o.serverId === activeServer?.id).map(obj => `
[${obj.name}](!)
type=${obj.type}
${obj.fields.map(f => `${f.key}=${f.value}`).join('\n')}
`).join('\n') || ""}

; ==============================================================================
; ENGINE OBJECTS
; ==============================================================================
${products?.map(p => {
  const prodObjects = objects?.filter(o => o.productId === p.id) || [];
  if (prodObjects.length === 0) return "";
  
  return `
; ------------------------------------------------------------------------------
; ENGINE: ${p.name.toUpperCase()}
; ------------------------------------------------------------------------------
${prodObjects.map(obj => `
[${obj.name}]${obj.isTemplate ? '(!)' : obj.inherits && obj.inherits !== 'none' ? `(${obj.inherits})` : ''}
${!obj.inherits || obj.inherits === 'none' ? `type=${obj.type}` : ''}
${obj.fields.map(f => `${f.key}=${f.value}`).join('\n')}
`).join('\n')}`;
}).join("") || ""}
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
          <h1 className="text-3xl font-bold tracking-tight">PJSIP Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Generated <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">pjsip.conf</code> for {activeServer.name}.
          </p>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 border border-border rounded-md bg-[#1e1e1e] p-4 overflow-hidden">
          <pre className="text-xs font-mono text-emerald-400 overflow-auto flex-1 whitespace-pre-wrap">
            {pjsipConfigPreview}
          </pre>
        </div>
      </div>
    </PageContainer>
  );
}
