"use client";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useSidebar } from "@/lib/contexts/sidebar-context";

export function PageContainer({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out ${
          isOpen ? "lg:pl-64 pl-0" : "pl-0"
        }`}
      >
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
