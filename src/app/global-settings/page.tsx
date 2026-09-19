"use client";

import { PageContainer } from "@/components/layout/page-container";
import { GlobalSettingsTab } from "@/components/pbx/global/global-settings-tab";
import { Settings } from "lucide-react";

export default function GlobalSettingsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings className="mr-3 h-8 w-8 text-primary" />
            Global PJSIP Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure server-wide [global] and [system] variables for your Asterisk server.
          </p>
        </div>
        
        <div className="mt-4">
          <GlobalSettingsTab />
        </div>
      </div>
    </PageContainer>
  );
}
