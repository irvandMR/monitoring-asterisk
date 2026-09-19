"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routingApi } from "@/lib/api/routing";
import { productApi } from "@/lib/api/products";
import { useServerContext } from "@/lib/contexts/server-context";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Code2 } from "lucide-react";
import { useState, useEffect, use } from "react";

export default function ProductDialplanPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.productId;
  
  const { activeServer } = useServerContext();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: products } = useQuery({
    queryKey: ["products", activeServer?.id],
    queryFn: () => productApi.getProducts(activeServer!.id),
    enabled: !!activeServer,
  });
  
  const product = products?.find(p => p.id === productId);

  const { data: dialplan, isLoading } = useQuery({
    queryKey: ["routing", productId],
    queryFn: () => routingApi.getDialplan(productId),
  });

  useEffect(() => {
    if (dialplan) {
      setContent(dialplan.content);
    }
  }, [dialplan]);

  const mutation = useMutation({
    mutationFn: (newContent: string) => routingApi.updateDialplan(productId, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routing", productId] });
    },
  });

  const handleSave = () => {
    mutation.mutate(content);
  };

  if (!activeServer) return null;

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Code2 className="mr-3 h-8 w-8 text-primary" />
              Dialplan Editor
            </h1>
            <p className="text-muted-foreground mt-2">
              Write your raw Asterisk dialplan (<code className="text-primary bg-primary/10 px-1 py-0.5 rounded">extensions.conf</code>) logic for {product?.name || "Engine"}.
            </p>
          </div>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save Dialplan"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center border rounded-md bg-[#1e1e1e]">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="flex-1 border rounded-md bg-[#1e1e1e] p-4 flex flex-col min-h-0">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-transparent border-none text-amber-400 font-mono text-sm resize-none focus-visible:ring-0 p-0"
              placeholder="[from-internal]&#10;exten => _X.,1,NoOp(Hello)&#10; same => n,Hangup()"
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
