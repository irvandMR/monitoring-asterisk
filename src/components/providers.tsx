"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ServerProvider } from "@/lib/contexts/server-context";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";
import { ThemeProvider } from "@/lib/contexts/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ServerProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ServerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
