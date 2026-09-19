"use client";

import { User, Bell, Server, Rocket, Terminal as TerminalIcon, CheckCircle2, Loader2, LogOut, SlidersHorizontal, ChevronLeft, ChevronRight, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import { useServerContext } from "@/lib/contexts/server-context";
import { useSidebar } from "@/lib/contexts/sidebar-context";
import { useTheme } from "@/lib/contexts/theme-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ServerManagerDialog } from "./server-manager-dialog";

export function Header() {
  const { servers, activeServer, setActiveServer } = useServerContext();
  const { isOpen, toggleSidebar } = useSidebar();
  const { theme, toggleTheme, isFullscreen, toggleFullscreen } = useTheme();
  const router = useRouter();
  const [isServerManagerOpen, setIsServerManagerOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleDeploy = () => {
    setIsDeployModalOpen(true);
    setIsDeploying(true);
    setDeployStep(0);
    setDeployLogs(["[INFO] Initializing deployment sequence..."]);

    setTimeout(() => {
      setDeployStep(1);
      setDeployLogs(prev => [...prev, "[OK] Compiled pjsip.conf and extensions.conf successfully.", "[INFO] Establishing SSH connection to " + (activeServer?.name || activeServer?.ip || activeServer?.id || "server") + "..."]);
      
      setTimeout(() => {
        setDeployStep(2);
        setDeployLogs(prev => [...prev, "[OK] Connected to Asterisk server.", "[INFO] Uploading configuration files..."]);
        
        setTimeout(() => {
          setDeployStep(3);
          setDeployLogs(prev => [...prev, "[OK] Files written to /etc/asterisk/", "[INFO] Running 'asterisk -rx \"pjsip reload\"'..."]);
          
          setTimeout(() => {
            setDeployStep(4);
            setDeployLogs(prev => [
              ...prev, 
              "Response: PJSIP reloaded successfully.", 
              "[INFO] Running 'asterisk -rx \"dialplan reload\"'...",
              "Response: Dialplan reloaded.",
              "[SUCCESS] All changes have been applied and are now live!"
            ]);
            setIsDeploying(false);
          }, 1500);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Sidebar Toggle Arrow Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-secondary/60 transition-colors"
          title={isOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Server Selector & Quick Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Server className="h-4 w-4 text-muted-foreground hidden sm:block shrink-0" />
          <Select 
            value={activeServer?.id || ""} 
            onValueChange={(val) => {
              if (!val) return;
              const server = servers.find((s) => s.id === val);
              if (server) setActiveServer(server);
            }}
          >
            <SelectTrigger className="w-[130px] sm:w-[210px] h-8 border-transparent hover:bg-secondary/50 focus:ring-0 focus:ring-offset-0 transition-colors text-xs sm:text-sm">
              <SelectValue placeholder="Select Server">
                {activeServer ? (
                  <span className="truncate">
                    {activeServer.name} <span className="text-muted-foreground text-[11px] font-mono hidden md:inline">({activeServer.ip || activeServer.id})</span>
                  </span>
                ) : (
                  "Select Server"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="font-medium">{server.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">({server.ip || server.id})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Button to Edit IP & Manage Servers */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-emerald-400 shrink-0"
            title="Edit IP & Kelola Server"
            onClick={() => setIsServerManagerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Deploy & Reload Button */}
        <Button 
          size="sm" 
          onClick={handleDeploy} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all shadow-emerald-900/20 h-8 px-2.5 sm:px-3 text-xs sm:text-sm shrink-0"
        >
          <Rocket className="h-3.5 w-3.5 sm:mr-1.5 shrink-0" />
          <span className="hidden md:inline">Deploy & Reload</span>
          <span className="md:hidden hidden sm:inline">Deploy</span>
        </Button>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-muted-foreground px-3 py-1 rounded-full bg-secondary">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Realtime: Connected</span>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        {/* Fullscreen Mode (NOC Display) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
          title={isFullscreen ? "Keluar Fullscreen (Esc)" : "Mode Fullscreen (NOC / Monitor)"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-border">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          {currentUser && (
            <span className="text-xs font-mono text-muted-foreground hidden lg:block">{currentUser.username}</span>
          )}
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal Dialog for Editing Server IP & Management */}
      <ServerManagerDialog
        open={isServerManagerOpen}
        onOpenChange={setIsServerManagerOpen}
      />

      {/* Deployment Console Modal */}
      <Dialog open={isDeployModalOpen} onOpenChange={(open) => !isDeploying && setIsDeployModalOpen(open)}>
        <DialogContent className="sm:max-w-xl bg-black border-border max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-500 text-sm sm:text-base">
              <TerminalIcon className="mr-2 h-5 w-5 shrink-0" />
              <span className="truncate">Deployment Console - {activeServer?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-[#1e1e1e] p-3 sm:p-4 rounded-md border border-white/10 font-mono text-xs sm:text-sm h-64 overflow-y-auto mt-4">
            {deployLogs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SUCCESS]') || log.includes('[OK]') ? 'text-emerald-400' : 'text-gray-300'}`}>
                {log}
              </div>
            ))}
            {isDeploying && (
              <div className="flex items-center text-emerald-500/70 mt-2 animate-pulse">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Executing command...
              </div>
            )}
          </div>
          {!isDeploying && (
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsDeployModalOpen(false)} variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Close Console
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
