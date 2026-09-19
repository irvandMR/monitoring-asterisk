"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Network, Terminal, Code2, FolderTree, ChevronDown, ChevronRight, Plus, Box, ShieldCheck, Contact, Radio, KeyRound, ShieldAlert, Copy, Radar } from "lucide-react";
import { useServerContext } from "@/lib/contexts/server-context";
import { useSidebar } from "@/lib/contexts/sidebar-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/products";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ProjectNavItem({ product, pathname, onItemClick }: { product: {id: string, name: string}, pathname: string, onItemClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(pathname.includes(`/product/${product.id}`));

  const objectTypes = [
    { name: "Endpoints", type: "endpoint", icon: Contact },
    { name: "AORs", type: "aor", icon: Radio },
    { name: "Auths", type: "auth", icon: KeyRound },
    { name: "Registrations", type: "registration", icon: ShieldCheck },
    { name: "Identifies", type: "identify", icon: ShieldAlert },
    { name: "Dialplan", type: "dialplan", icon: Code2 },
  ];

  return (
    <div className="flex flex-col space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      >
        <div className="flex items-center space-x-3">
          <Box className="h-4 w-4" />
          <span className="font-medium text-sidebar-foreground">{product.name}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="flex flex-col space-y-1 pl-9 pr-2 py-1 border-l-2 border-sidebar-border ml-5">
          {objectTypes.map(obj => {
            const href = `/product/${product.id}/${obj.type}`;
            const isActive = pathname === href;
            return (
              <Link
                key={obj.type}
                href={href}
                onClick={onItemClick}
                className={`flex items-center space-x-3 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-muted-foreground hover:text-sidebar-foreground"
                }`}
              >
                <obj.icon className="h-3.5 w-3.5" />
                <span>{obj.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { activeServer } = useServerContext();
  const { isOpen, closeSidebar } = useSidebar();
  const queryClient = useQueryClient();
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");

  const { data: products } = useQuery({
    queryKey: ["products", activeServer?.id],
    queryFn: () => productApi.getProducts(activeServer!.id),
    enabled: !!activeServer,
  });

  const createProductMutation = useMutation({
    mutationFn: (name: string) => productApi.createProduct(activeServer!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeServer?.id] });
      setIsAddProductOpen(false);
      setNewProductName("");
    }
  });

  const handleAddProduct = () => {
    if (newProductName.trim() && activeServer) {
      createProductMutation.mutate(newProductName.trim());
    }
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const systemConfigs = [
    { name: "Global Settings", href: "/global-settings", icon: Settings },
    { name: "Transports", href: "/transports", icon: Network },
    { name: "Templates", href: "/templates", icon: Copy },
  ];

  const systemPreviews = [
    { name: "PJSIP Config", href: "/pjsip-config", icon: Terminal },
    { name: "Dialplan Config", href: "/dialplan-config", icon: Code2 },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: slides in/out on both desktop and mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col w-64 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border shrink-0">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center font-bold text-sm sm:text-base text-primary hover:text-emerald-400 transition-colors truncate"
          >
            <FolderTree className="mr-2 h-5 w-5 shrink-0" />
            <span>Asterisk Manager</span>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* System Level Configs */}
          <div>
            <div className="text-xs font-mono text-muted-foreground mb-3 px-2 uppercase tracking-wider font-semibold">
              Server Config
            </div>
            <nav className="flex flex-col space-y-1">
              {systemConfigs.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    title={item.name}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Global Live Monitor */}
          <div>
            <Link 
              href="/monitor" 
              onClick={handleNavClick}
              title="Live Monitor"
              className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md group ${pathname === '/monitor' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <div className="flex items-center">
                <Radar className="mr-3 h-4 w-4 flex-shrink-0" />
                <span>Live Monitor</span>
              </div>
              {pathname === '/monitor' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </Link>
          </div>

          {/* Dynamic Projects */}
          <div>
            <div className="flex items-center justify-between px-2 mb-3">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Projects
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-muted-foreground hover:text-primary"
                onClick={() => setIsAddProductOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-1">
              {products?.length === 0 ? (
                <div className="px-3 text-xs text-muted-foreground italic py-2">No projects found.</div>
              ) : (
                products?.map(product => (
                  <ProjectNavItem key={product.id} product={product} pathname={pathname} onItemClick={handleNavClick} />
                ))
              )}
            </nav>
          </div>

          {/* Previews */}
          <div>
            <div className="text-xs font-mono text-muted-foreground mb-3 px-2 uppercase tracking-wider font-semibold">
              System Previews
            </div>
            <nav className="flex flex-col space-y-1">
              {systemPreviews.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    title={item.name}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Project Name (e.g. Call Center / IVR)" 
                value={newProductName} 
                onChange={(e) => setNewProductName(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddProduct();
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddProduct} 
                disabled={createProductMutation.isPending || !newProductName.trim()}
              >
                {createProductMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>
    </>
  );
}
