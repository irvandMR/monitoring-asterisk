"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
import { Server, Activity, PhoneCall, Users, Cpu, Clock, CheckCircle2, XCircle, Power } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { servers, serverStatuses, checkServerStatus } = useServerContext();
  const [mounted, setMounted] = useState(false);
  const [restartingServers, setRestartingServers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRestart = (id: string) => {
    setRestartingServers((prev) => ({ ...prev, [id]: true }));
    // Mock restart delay
    setTimeout(() => {
      setRestartingServers((prev) => ({ ...prev, [id]: false }));
      checkServerStatus(id); // Re-check status after restart
    }, 3000);
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Command Center</h1>
          <p className="text-muted-foreground">High-level overview of your PBX Infrastructure.</p>
        </div>

        {/* Global Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Server className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Servers</p>
                <h3 className="text-2xl font-bold">{servers.length}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <PhoneCall className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Calls</p>
                <h3 className="text-2xl font-bold">143</h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registered Endpoints</p>
                <h3 className="text-2xl font-bold">892</h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Cpu className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg CPU Load</p>
                <h3 className="text-2xl font-bold">24%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Server Health */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Server Health Status
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => {
              const status = serverStatuses[server.id];
              const isChecking = !status;
              const isServerUp = status?.serverUp ?? false;
              const isAsteriskUp = status?.asteriskUp ?? false;
              const isRestarting = restartingServers[server.id];

              // Styles based on status
              const cardClass = isChecking || isRestarting
                ? "border-border bg-card/50"
                : isAsteriskUp
                ? "border-emerald-500/30 bg-emerald-950/10"
                : isServerUp
                ? "border-orange-500/30 bg-orange-950/10"
                : "border-destructive/30 bg-destructive/10";

              return (
                <div key={server.id} className={`relative overflow-hidden rounded-xl border ${cardClass} p-5 transition-all hover:shadow-md`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {isChecking ? (
                        <Clock className="h-5 w-5 text-muted-foreground animate-pulse mr-2" />
                      ) : isAsteriskUp ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                      ) : isServerUp ? (
                        <Activity className="h-5 w-5 text-orange-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mr-2" />
                      )}
                      <h3 className="font-bold text-lg">{server.name}</h3>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <button 
                        onClick={() => handleRestart(server.id)}
                        disabled={isRestarting || !isServerUp}
                        className={`flex items-center text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                          isRestarting 
                            ? 'bg-orange-500/20 text-orange-400 cursor-wait' 
                            : !isServerUp 
                              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        <Power className={`h-3 w-3 mr-1 ${isRestarting ? 'animate-pulse' : ''}`} />
                        {isRestarting ? 'Restarting...' : 'Restart'}
                      </button>
                      <button 
                        onClick={() => checkServerStatus(server.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer underline decoration-dotted"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mt-4">
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="font-mono text-foreground">{server.ip || server.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mesin (SSH):</span>
                      <span className={`font-mono ${isChecking ? 'text-muted-foreground' : isServerUp ? 'text-emerald-500' : 'text-destructive'}`}>
                        {isChecking ? 'Checking...' : isServerUp ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Asterisk (AMI):</span>
                      <span className={`font-mono ${isChecking || isRestarting ? 'text-muted-foreground animate-pulse' : isAsteriskUp ? 'text-emerald-500' : 'text-destructive'}`}>
                        {isChecking ? 'Checking...' : isRestarting ? 'Restarting...' : isAsteriskUp ? 'Running' : 'Stopped/Error'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/50 p-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Recent System Activity
            </h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { time: "Just now", msg: "Configuration deployed to Server 10.0.0.50", type: "success" },
              { time: "10 mins ago", msg: "Endpoint 1001 registered from 10.0.2.14", type: "info" },
              { time: "1 hr ago", msg: "Server 192.168.10.14 heartbeat timeout", type: "error" },
              { time: "2 hrs ago", msg: "SIP Trunk VOIP-PROVIDER re-registered", type: "info" },
            ].map((log, i) => (
              <div key={i} className="p-4 flex items-start space-x-4 hover:bg-secondary/20 transition-colors">
                <div className="mt-0.5">
                  <div className={`h-2 w-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-destructive' : 'bg-blue-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{log.msg}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
