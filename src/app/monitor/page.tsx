"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
import { useAmiContext } from "@/lib/contexts/ami-context";
import { Radar, Search, Filter, RefreshCw, Wifi, WifiOff, AlertTriangle, Contact } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EndpointStatus = "Avail" | "Unreachable" | "Unknown";

interface MockEndpoint {
  id: string;
  name: string;
  status: EndpointStatus;
  contact: string;
  ping: string;
}

interface MockContact {
  id: string;
  uri: string;
  aor: string;
  hash: string;
  status: "Avail" | "Unavail" | "NonQual" | "Unknown";
  rtt: string;
}

interface MockChannel {
  id: string;
  channel: string;
  state: string;
  application: string;
  duration: string;
}

interface MockAriApp {
  name: string;
  subscribers: string;
}

interface MockRegistration {
  id: string;
  name: string;
  auth: string;
  status: string;
  exp: string;
}

interface MockRtp {
  id: string;
  channel: string;
  txJitter: string;
  rxJitter: string;
  txLoss: string;
  rxLoss: string;
}

export default function MonitorPage() {
  const { activeServer } = useServerContext();
  const { isConnected, endpoints, contacts, channels, registrations, logs: amiLogs, clearLogs, addLog } = useAmiContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [containerName, setContainerName] = useState("ari-server");
  const [dockerStatus, setDockerStatus] = useState("Disconnected");
  
  // Custom console logs state
  const [cliLogs, setCliLogs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ariApps, setAriApps] = useState<MockAriApp[]>([]);
  const [rtpStats, setRtpStats] = useState<MockRtp[]>([]);
  const [dockerLogLines, setDockerLogLines] = useState<string[]>([
    "ari-server | Starting ARI server...",
    "ari-server | Connected to Asterisk at ws://127.0.0.1:8088/ari/events"
  ]);
  const [dockerLoggerWidth, setDockerLoggerWidth] = useState(500);

  // State to control which panels are visible
  const [views, setViews] = useState({
    endpoints: true,
    contacts: true,
    registrations: true,
    channels: false,
    ariApps: false,
    rtp: false,
    logger: false,
    dockerLogs: false
  });

  // State for logger panel width
  const [loggerWidth, setLoggerWidth] = useState(500);

  // Setup default panels on server change
  useEffect(() => {
    if (!activeServer) return;
    setViews(prev => ({ 
      ...prev, 
      endpoints: true, 
      contacts: true, 
      registrations: true, 
      channels: true, 
      ariApps: false 
    }));
  }, [activeServer]);

  // Real Docker Logs Connection
  useEffect(() => {
    if (!views.dockerLogs || !activeServer || !containerName) return;
    
    setDockerStatus("Connecting...");
    const evtSource = new EventSource(`/api/docker-logs?serverId=${activeServer.id}&container=${encodeURIComponent(containerName)}`);
    
    evtSource.addEventListener("connected", (e: any) => {
      const data = JSON.parse(e.data);
      setDockerStatus("Connected");
      setDockerLogLines(prev => [...prev, data.message]);
    });

    evtSource.addEventListener("log", (e: any) => {
      // The data is a simple string for logs
      let logLine = e.data;
      try { logLine = JSON.parse(e.data); } catch(e) {}
      setDockerLogLines(prev => {
        const next = [...prev, logLine];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });
    });

    evtSource.addEventListener("closed", (e: any) => {
      setDockerStatus("Disconnected");
    });

    evtSource.addEventListener("error", (e: any) => {
      setDockerStatus("Error");
      evtSource.close();
    });

    return () => {
      evtSource.close();
    };
  }, [views.dockerLogs, activeServer?.id, containerName]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // You could theoretically re-run AmiClient reconnect here, 
    // but the backend SSE maintains the state.
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!activeServer) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-muted-foreground">Please select a server to view Live Monitor.</p>
        </div>
      </PageContainer>
    );
  }

  const mappedEndpoints = endpoints.map((ep: any, i) => ({
    id: ep.Endpoint || ep.ObjectName || `ep-${i}`,
    name: ep.ObjectName || ep.Endpoint || `Endpoint-${i}`,
    status: ep.PeerStatus === "Reachable" || ep.DeviceState === "Not in use" ? "Avail" : ep.PeerStatus === "Unreachable" || ep.DeviceState === "Unavailable" ? "Unreachable" : ep.DeviceState || "Unknown",
    contact: ep.Address || ep.Peer || ep.Contacts || "Unknown",
    ping: ep.Time ? `${ep.Time}ms` : "N/A"
  }));

  const filteredEndpoints = mappedEndpoints.filter(ep => {
    const matchesSearch = ep.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ep.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const combinedContacts = new Map();

  // 1. Map endpoints as base contacts
  (endpoints || []).forEach((ep: any) => {
    const uri = ep.URI || ep.ContactUri || ep.Address || ep.Contacts;
    if (uri && uri !== "Unknown URI") {
       const aor = ep.ObjectName || ep.Endpoint;
       combinedContacts.set(aor, {
         id: aor || `ep-${Math.random()}`,
         uri: uri,
         aor: aor || "Unknown AOR",
         hash: ep.Hash || "N/A",
         status: ep.PeerStatus === "Reachable" || ep.DeviceState === "Not in use" ? "Avail" : ep.PeerStatus === "Unreachable" || ep.DeviceState === "Unavailable" ? "Unavail" : ep.DeviceState || "Unknown",
         rtt: ep.Time ? `${ep.Time}ms` : "N/A"
       });
    }
  });

  // 2. Override with real-time contact events
  (contacts || []).forEach((c: any) => {
     const aor = c.AOR || c.Aor || c.ObjectName || "Unknown AOR";
     const uri = c.URI || c.ContactUri || c.Address || c.Contacts;
     
     if (c.ContactStatus === "Removed") {
        combinedContacts.delete(aor);
        return;
     }

     if (uri && uri !== "Unknown URI") {
       combinedContacts.set(aor, {
         id: c.ObjectName || c.URI || aor,
         uri: uri,
         aor: aor,
         hash: c.Hash || "N/A",
         status: c.ContactStatus === "Reachable" || c.Status === "NonQual" || c.ContactStatus === "Created" || c.ContactStatus === "NonQualified" ? "Avail" : c.ContactStatus === "Unreachable" || c.ContactStatus === "Removed" ? "Unavail" : c.ContactStatus || c.Status || "Unknown",
         rtt: c.RoundtripUsec ? `${(parseInt(c.RoundtripUsec)/1000).toFixed(2)}ms` : c.RTT ? `${c.RTT}ms` : c.Time ? `${c.Time}ms` : "N/A"
       });
     }
  });

  const mappedContacts = Array.from(combinedContacts.values());

  const filteredContacts = mappedContacts.filter(c => {
    const matchesSearch = 
      c.uri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.aor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "avail" && c.status === "Avail") ||
      (statusFilter === "unreachable" && (c.status === "Unavail" || c.status === "NonQual")) ||
      (statusFilter === "unknown" && c.status === "Unknown");
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Radar className="mr-3 h-8 w-8 text-emerald-500" />
              Live Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time endpoint & registration status for {activeServer.name}.
              {isConnected ? (
                <span className="ml-3 inline-flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Live</span>
              ) : (
                <span className="ml-3 inline-flex items-center text-xs font-medium text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-1.5"></span>Offline</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoint / contact..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="avail">Available</SelectItem>
                <SelectItem value="unreachable">Unreachable</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2 p-3 bg-card border border-border rounded-lg shrink-0">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Visible Panels:</span>
          <Button 
            variant={views.endpoints ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.endpoints ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, endpoints: !prev.endpoints}))}
          >
            PJSIP Endpoints
          </Button>
          <Button 
            variant={views.contacts ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.contacts ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, contacts: !prev.contacts}))}
          >
            PJSIP Contacts
          </Button>
          <Button 
            variant={views.registrations ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.registrations ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, registrations: !prev.registrations}))}
          >
            PJSIP Registrations
          </Button>
          <Button 
            variant={views.channels ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.channels ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, channels: !prev.channels}))}
          >
            Active Channels
          </Button>
          <Button 
            variant={views.ariApps ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.ariApps ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, ariApps: !prev.ariApps}))}
          >
            ARI Applications
          </Button>
          <Button 
            variant={views.rtp ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.rtp ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, rtp: !prev.rtp}))}
          >
            RTP Stats
          </Button>
          <Button 
            variant={views.logger ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.logger ? 'bg-zinc-800 hover:bg-zinc-900 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, logger: !prev.logger}))}
          >
            Asterisk CLI & Logger
          </Button>
          <Button 
            variant={views.dockerLogs ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.dockerLogs ? 'bg-sky-600 hover:bg-sky-700 text-white' : ''}`}
            onClick={() => setViews(prev => ({...prev, dockerLogs: !prev.dockerLogs}))}
          >
            Docker Logs (ARI)
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto h-full space-y-4 w-full pr-2 pb-6">
          {views.channels && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <h2 className="text-sm font-semibold text-muted-foreground p-4 bg-muted/20">Active Calls / Channels</h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Channel</th>
                    <th className="px-6 py-3 font-semibold">State</th>
                    <th className="px-6 py-3 font-semibold">App</th>
                    <th className="px-6 py-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No active channels.</td>
                    </tr>
                  ) : (
                    channels.map((ch: any, i) => (
                      <tr key={ch.Uniqueid || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-emerald-400">{ch.Channel}</td>
                        <td className="px-6 py-4">{ch.ChannelStateDesc}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ch.Application}</td>
                        <td className="px-6 py-4 font-mono">--:--:--</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {views.ariApps && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <h2 className="text-sm font-semibold text-muted-foreground p-4 bg-muted/20">ARI Registered Applications</h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Application Name</th>
                    <th className="px-6 py-3 font-semibold">Subscribers</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ariApps.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No ARI applications registered.</td>
                    </tr>
                  ) : (
                    ariApps.map((app, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-blue-400">{app.name}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{app.subscribers}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {views.endpoints && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <h2 className="text-sm font-semibold text-muted-foreground p-4 bg-muted/20">
                PJSIP Endpoints (pjsip show endpoints)
              </h2>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                <tr>
                  <th className="px-6 py-3 font-semibold">Endpoint Name</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Contact IP</th>
                  <th className="px-6 py-3 font-semibold">Ping (RTT)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No endpoints found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEndpoints.map((ep) => (
                    <tr key={ep.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {ep.name}
                      </td>
                      <td className="px-6 py-4">
                        {ep.status === "Avail" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                            <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Avail
                          </span>
                        ) : ep.status === "Unreachable" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                            <span className="w-2 h-2 mr-1.5 bg-destructive rounded-full"></span>
                            Unreachable
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
                            <span className="w-2 h-2 mr-1.5 bg-orange-500 rounded-full"></span>
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {ep.contact}
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {ep.ping}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}

          {views.contacts && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <div className="p-4 bg-muted/20 flex items-center justify-between border-b border-border/50">
                <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Contact className="h-4 w-4 text-teal-400" />
                  PJSIP Contacts (pjsip show contacts)
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                  Total: {filteredContacts.length} Contacts
                </span>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Contact / ContactURI</th>
                    <th className="px-6 py-3 font-semibold">AOR</th>
                    <th className="px-6 py-3 font-semibold">Hash</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">RTT (Latency)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No contacts found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-foreground">{c.uri}</td>
                        <td className="px-6 py-4 font-mono text-muted-foreground">{c.aor}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.hash}</td>
                        <td className="px-6 py-4">
                          {c.status === "Avail" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                              <span className="w-2 h-2 mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                              Avail
                            </span>
                          ) : c.status === "Unavail" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                              <span className="w-2 h-2 mr-1.5 bg-destructive rounded-full"></span>
                              Unavail
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400">
                              {c.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {c.rtt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {views.registrations && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <h2 className="text-sm font-semibold text-muted-foreground p-4 bg-muted/20">PJSIP Outbound Registrations</h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Registration / ServerURI</th>
                    <th className="px-6 py-3 font-semibold">Auth</th>
                    <th className="px-6 py-3 font-semibold">Status (Exp)</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No outbound registrations found.</td>
                    </tr>
                  ) : (
                    registrations.map((reg: any, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-foreground">{reg.Domain || reg.ObjectName || reg.ServerUri}</td>
                        <td className="px-6 py-4 font-mono text-muted-foreground">{reg.Username || reg.Auth || reg.ClientUri}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {reg.Status === "Registered" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                                Registered
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                                {reg.Status || "Unknown"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {views.rtp && (
            <div className="overflow-x-auto border border-border bg-card rounded-md">
              <h2 className="text-sm font-semibold text-muted-foreground p-4 bg-muted/20">RTP Stream Statistics</h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Channel</th>
                    <th className="px-6 py-3 font-semibold">TX Jitter</th>
                    <th className="px-6 py-3 font-semibold">RX Jitter</th>
                    <th className="px-6 py-3 font-semibold">TX Loss</th>
                    <th className="px-6 py-3 font-semibold">RX Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {rtpStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No active RTP streams.</td>
                    </tr>
                  ) : (
                    rtpStats.map((rtp) => (
                      <tr key={rtp.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-emerald-400">{rtp.channel}</td>
                        <td className="px-6 py-4 font-mono">{rtp.txJitter}</td>
                        <td className="px-6 py-4 font-mono">{rtp.rxJitter}</td>
                        <td className="px-6 py-4 font-mono text-emerald-500">{rtp.txLoss}</td>
                        <td className="px-6 py-4 font-mono text-emerald-500">{rtp.rxLoss}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>

          {views.logger && (
            <>
              {/* Drag Handle (Visible on large screens) */}
              <div 
                className="hidden lg:flex w-2 cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 transition-colors flex-col items-center justify-center shrink-0 z-10 -mx-1"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = loggerWidth;
                  
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    // Moving mouse to left increases width because logger is on the right
                    const delta = startX - moveEvent.clientX;
                    setLoggerWidth(Math.max(300, Math.min(900, startWidth + delta)));
                  };
                  
                  const onMouseUp = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    document.body.style.cursor = 'default';
                  };
                  
                  document.body.style.cursor = 'col-resize';
                  document.addEventListener("mousemove", onMouseMove);
                  document.addEventListener("mouseup", onMouseUp);
                }}
              >
                <div className="h-10 w-1 bg-zinc-600 rounded-full" />
              </div>

              {/* Logger Panel */}
              <div 
                className="w-full shrink-0 overflow-hidden border border-border bg-black rounded-md flex flex-col h-full"
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${loggerWidth}px` : '100%' }}
              >
                <div className="text-sm font-semibold text-zinc-400 p-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                  <span>Asterisk CLI & Logger</span>
                  <div className="flex space-x-2">
                    <button onClick={clearLogs} className="text-[10px] text-zinc-500 hover:text-zinc-300 mr-2 border border-zinc-700 px-2 py-0.5 rounded">Clear</button>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-zinc-350 whitespace-pre-wrap flex flex-col"
                   ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                {amiLogs.length === 0 ? (
                  <div className="text-zinc-600 italic">No logs yet...</div>
                ) : (
                  amiLogs.map((log, i) => {
                    if (log.startsWith('[System]')) return <div key={i} className="text-emerald-500 font-semibold">{log}</div>;
                    if (log.startsWith('[Error]')) return <div key={i} className="text-red-500 font-semibold">{log}</div>;
                    if (log.startsWith('[Event]')) return <div key={i} className="text-blue-400">{log}</div>;
                    if (log.startsWith('> ')) return <div key={i} className="text-white font-bold mt-2">{log}</div>;
                    return <div key={i} className={`whitespace-pre-wrap mb-1 leading-relaxed ${log.includes('Error') || log.includes('WARNING') ? 'text-red-400' : log.includes('System') || log.includes('Connected') ? 'text-emerald-400' : 'text-zinc-300'}`}>{log}</div>;
                  })
                )}
              </div>
              <div className="p-2 bg-zinc-950 border-t border-zinc-800 flex items-center shrink-0">
                <span className="text-emerald-500 font-mono mr-2 ml-1 whitespace-nowrap">{activeServer.name}*CLI{'>'}</span>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-none text-emerald-400 font-mono text-sm focus:outline-none focus:ring-0 placeholder-zinc-600"
                  placeholder="Execute CLI cmd... (e.g. core show uptime)"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      let cmd = e.currentTarget.value;
                      if (!cmd.trim()) return;
                      e.currentTarget.value = '';
                      
                      if (cmd.trim().toLowerCase() === 'clear') {
                        clearLogs();
                        return;
                      }

                      // Strip 'asterisk -rx' or 'asterisk -x' if user pasted it
                      const asteriskRxMatch = cmd.match(/^asterisk\s+-r?x\s+["'](.*)["']$/i) || cmd.match(/^asterisk\s+-r?x\s+(.*)$/i);
                      if (asteriskRxMatch) {
                        cmd = asteriskRxMatch[1];
                      }

                      addLog(`> ${cmd}`);
                      try {
                        const res = await fetch('/api/ami/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            serverId: activeServer.id,
                            action: 'Command',
                            Command: cmd
                          })
                        });
                        const data = await res.json();
                        if (data.success && data.data) {
                          // The raw AMI response usually includes the output in `output` or as an array
                          const output = data.data.Output || data.data.output || data.data.response || data.data;
                          let lines = Array.isArray(output) ? output : typeof output === 'string' ? output.split('\n') : [JSON.stringify(output)];
                          // Filter out empty lines to avoid spam
                          lines = lines.filter((l: string) => l.trim() !== '');
                          lines.forEach((l: string) => addLog(l));
                        } else {
                          addLog(`[Error] ${data.error || 'Failed to execute command'}`);
                        }
                      } catch (err: any) {
                        addLog(`[Error] ${err.message}`);
                      }
                    }
                  }}
                />
              </div>
              </div>
            </>
          )}

          {views.dockerLogs && (
            <>
              {/* Drag Handle for Docker Logs */}
              <div 
                className="hidden lg:flex w-2 cursor-col-resize hover:bg-sky-500/50 active:bg-sky-500 transition-colors flex-col items-center justify-center shrink-0 z-10 -mx-1"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = dockerLoggerWidth;
                  
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const delta = startX - moveEvent.clientX;
                    setDockerLoggerWidth(Math.max(300, Math.min(900, startWidth + delta)));
                  };
                  
                  const onMouseUp = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    document.body.style.cursor = 'default';
                  };
                  
                  document.body.style.cursor = 'col-resize';
                  document.addEventListener("mousemove", onMouseMove);
                  document.addEventListener("mouseup", onMouseUp);
                }}
              >
                <div className="h-10 w-1 bg-zinc-600 rounded-full" />
              </div>

              {/* Docker Logs Panel */}
              <div 
                className="w-full shrink-0 overflow-hidden border border-sky-900/50 bg-[#0d1117] rounded-md flex flex-col h-full"
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${dockerLoggerWidth}px` : '100%' }}
              >
                <div className="text-sm font-semibold text-zinc-300 p-2 bg-[#161b22] border-b border-[#30363d] flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400">🐳</span>
                    <input 
                      type="text" 
                      value={containerName}
                      onChange={(e) => setContainerName(e.target.value)}
                      placeholder="Container name (e.g. ari-server)"
                      className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-zinc-300 outline-none focus:border-sky-500 w-48"
                    />
                  </div>
                  <div className="flex space-x-2 items-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dockerStatus === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' : dockerStatus.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {dockerStatus}
                    </span>
                    <button onClick={() => setDockerLogLines([])} className="text-[10px] text-muted-foreground hover:text-zinc-300 px-1.5 py-0.5 bg-muted rounded border border-border">Clear</button>
                  </div>
                </div>
                <div className="p-4 font-mono text-xs overflow-y-auto flex-1 h-full block">
                  {dockerLogLines.map((line, i) => (
                    <div key={i} className={`whitespace-pre-wrap mb-1 leading-relaxed ${line.includes('[ERROR]') ? 'text-red-400' : line.includes('[DEBUG]') ? 'text-zinc-500' : line.includes('[INFO]') ? 'text-sky-300' : 'text-zinc-300'}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
