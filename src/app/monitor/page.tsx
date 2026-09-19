"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useServerContext } from "@/lib/contexts/server-context";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [contacts, setContacts] = useState<MockContact[]>([]);
  const [channels, setChannels] = useState<MockChannel[]>([]);
  const [ariApps, setAriApps] = useState<MockAriApp[]>([]);
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);
  const [rtpStats, setRtpStats] = useState<MockRtp[]>([]);
  const [logLines, setLogLines] = useState<string[]>([
    `[${new Date().toISOString()}] Asterisk ready.`,
    `[${new Date().toISOString()}] Connected to Asterisk Manager Interface.`
  ]);
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

  // Generate mock data when server changes (no role restriction - a server can host multiple projects)
  useEffect(() => {
    if (!activeServer) return;
    
    // Set active panels
    setViews(prev => ({ 
      ...prev, 
      endpoints: true, 
      contacts: true, 
      registrations: true, 
      channels: true, 
      ariApps: false 
    }));

    // Endpoints
    const mockEndpoints: MockEndpoint[] = [
      { id: "1", name: "1001", status: "Avail", contact: "10.0.2.14:5060", ping: "45ms" },
      { id: "2", name: "1002", status: "Avail", contact: "10.0.2.15:5060", ping: "12ms" },
      { id: "3", name: "1003", status: "Unreachable", contact: "Unknown", ping: "Timeout" },
      { id: "4", name: "voip-trunk", status: "Avail", contact: "203.0.113.5:5060", ping: "22ms" },
      { id: "5", name: "220121363", status: "Avail", contact: "10.0.3.50:5060", ping: "8ms" },
    ];
    setEndpoints(mockEndpoints);

    // Dedicated PJSIP Contacts (matches `pjsip show contacts`)
    const mockContacts: MockContact[] = [
      { id: "c1", uri: "1001/sip:1001@10.0.2.14:5060;transport=udp", aor: "1001", hash: "99423b03d5", status: "Avail", rtt: "12.345 ms" },
      { id: "c2", uri: "1002/sip:1002@10.0.2.15:5060;transport=udp", aor: "1002", hash: "8c92a104b1", status: "Avail", rtt: "21.120 ms" },
      { id: "c3", uri: "1003/sip:1003@10.0.2.16:5060;transport=udp", aor: "1003", hash: "a7e89123f4", status: "Unavail", rtt: "nan" },
      { id: "c4", uri: "voip-trunk/sip:203.0.113.5:5060;transport=udp", aor: "voip-trunk", hash: "4f128c9b20", status: "Avail", rtt: "18.450 ms" },
      { id: "c5", uri: "220121363/sip:220121363@10.0.3.50:5060;transport=udp", aor: "220121363", hash: "3e459a11c8", status: "Avail", rtt: "8.120 ms" },
    ];
    setContacts(mockContacts);

    // Active Channels
    const mockChannels: MockChannel[] = [
      { id: "ch1", channel: "PJSIP/1001-00000001", state: "Up", application: "Dial", duration: "00:02:15" },
      { id: "ch2", channel: "PJSIP/voip-trunk-00000002", state: "Ringing", application: "Dial", duration: "00:00:05" },
      { id: "ch3", channel: "PJSIP/220121363-00000003", state: "Up", application: "Playback", duration: "00:01:20" },
    ];
    setChannels(mockChannels);

    // ARI Apps
    const mockAri: MockAriApp[] = [
      { name: "call-center-queue", subscribers: "4 Endpoint(s), 2 Channel(s)" },
      { name: "ivr-main-menu", subscribers: "3 Endpoint(s), 12 Channel(s)" },
      { name: "voicemail-service", subscribers: "0 Endpoint(s), 0 Channel(s)" }
    ];
    setAriApps(mockAri);

    // Outbound Registrations
    const mockRegs: MockRegistration[] = [
      { id: "r1", name: "voip-trunk-reg-1/sip:103.52.146.118", auth: "voip-trunk-auth-1", status: "Registered", exp: "1433s" },
      { id: "r2", name: "voip-trunk-reg-2/sip:103.52.146.118", auth: "voip-trunk-auth-2", status: "Registered", exp: "1696s" },
      { id: "r3", name: "voip-trunk-reg-3/sip:103.52.146.118", auth: "voip-trunk-auth-3", status: "Rejected", exp: "-3s" },
    ];
    setRegistrations(mockRegs);

    // RTP Stream Statistics
    setRtpStats([
      { id: "rtp1", channel: "PJSIP/1001-00000001", txJitter: "2ms", rxJitter: "1ms", txLoss: "0%", rxLoss: "0%" },
      { id: "rtp2", channel: "PJSIP/220121363-00000003", txJitter: "5ms", rxJitter: "3ms", txLoss: "0.1%", rxLoss: "0%" }
    ]);
  }, [activeServer]);

  // Simulate scrolling logs
  useEffect(() => {
    if (!views.logger) return;
    
    const interval = setInterval(() => {
      setLogLines(prev => {
        const events = [
          `[${new Date().toISOString()}] VERBOSE[123] pbx.c: Executing [1001@from-internal:1] Dial("PJSIP/1000", "PJSIP/1001,20") in new stack`,
          `[${new Date().toISOString()}] WARNING[456] res_pjsip_pubsub.c: No registered subscribe handler for event presence`,
          `[${new Date().toISOString()}] VERBOSE[789] app_dial.c: Called PJSIP/1001`,
          `[${new Date().toISOString()}] VERBOSE[789] app_dial.c: PJSIP/1001-00000001 is ringing`,
          `[${new Date().toISOString()}] VERBOSE[789] app_dial.c: PJSIP/1001-00000001 answered PJSIP/1000`,
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const newLines = [...prev, randomEvent];
        return newLines.slice(-50); // Keep last 50 lines
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [views.logger]);

  // Simulate scrolling docker logs
  useEffect(() => {
    if (!views.dockerLogs) return;
    
    const interval = setInterval(() => {
      setDockerLogLines(prev => {
        const events = [
          `ari-server | [INFO] Processing StasisStart event for channel PJSIP/1001-00000001`,
          `ari-server | [DEBUG] Playing playback 'beep' on channel PJSIP/1001-00000001`,
          `ari-server | [INFO] Channel PJSIP/1001-00000001 entered application 'ivr-main-menu'`,
          `ari-server | [DEBUG] Received DTMF '1' from channel PJSIP/1001-00000001`,
          `ari-server | [INFO] Processing StasisEnd event for channel PJSIP/1000-00000002`,
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const newLines = [...prev, randomEvent];
        return newLines.slice(-50); // Keep last 50 lines
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [views.dockerLogs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Randomly shuffle some statuses for visual effect
      setEndpoints(prev => prev.map(ep => {
        if (ep.status === "Unknown" && Math.random() > 0.5) {
          return { ...ep, status: "Avail", contact: "192.168.1.55:5060", ping: "33ms" };
        }
        return ep;
      }));
      setContacts(prev => prev.map(c => {
        if (c.status === "Avail") {
          const newRtt = (Math.random() * 25 + 5).toFixed(3) + " ms";
          return { ...c, rtt: newRtt };
        }
        return c;
      }));
      setIsRefreshing(false);
    }, 1000);
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

  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch = ep.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ep.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.uri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.aor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "avail" && c.status === "Avail") ||
      (statusFilter === "unreachable" && (c.status === "Unavail" || c.status === "NonQual")) ||
      (statusFilter === "unknown" && c.status === "Unknown");
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Radar className="mr-3 h-8 w-8 text-emerald-500" />
              Live Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time endpoint & registration status for {activeServer.name}.
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

        <div className="flex flex-wrap items-center gap-2 mb-2 p-3 bg-card border border-border rounded-lg">
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
            className={`h-8 ${views.channels ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            onClick={() => setViews(prev => ({...prev, channels: !prev.channels}))}
          >
            Active Channels
          </Button>
          <Button 
            variant={views.ariApps ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.ariApps ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            onClick={() => setViews(prev => ({...prev, ariApps: !prev.ariApps}))}
          >
            ARI Applications
          </Button>
          <Button 
            variant={views.rtp ? "default" : "outline"} 
            size="sm" 
            className={`h-8 ${views.rtp ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
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

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 rounded-md overflow-hidden space-y-4 w-full">
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
                    channels.map((ch) => (
                      <tr key={ch.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-emerald-400">{ch.channel}</td>
                        <td className="px-6 py-4">{ch.state}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ch.application}</td>
                        <td className="px-6 py-4 font-mono">{ch.duration}</td>
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
                    registrations.map((reg) => (
                      <tr key={reg.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-foreground">{reg.name}</td>
                        <td className="px-6 py-4 font-mono text-muted-foreground">{reg.auth}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {reg.status === "Registered" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                                Registered
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                                {reg.status}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground font-mono">
                              {reg.exp.startsWith('-') ? `(exp. ${reg.exp.substring(1)}s ago)` : `(exp. ${reg.exp})`}
                            </span>
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
                className="w-full shrink-0 sticky top-4 overflow-hidden border border-border bg-black rounded-md flex flex-col h-[calc(100vh-32px)]"
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${loggerWidth}px` : '100%' }}
              >
                <div className="text-sm font-semibold text-zinc-400 p-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                  <span>Asterisk CLI & Logger</span>
                  <div className="flex space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
              </div>
              <div className="p-2 bg-zinc-950 border-b border-zinc-800 flex items-center shrink-0">
                <span className="text-emerald-500 font-mono mr-2 ml-1">{'>'}</span>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-none text-emerald-400 font-mono text-sm focus:outline-none focus:ring-0 placeholder-zinc-600"
                  placeholder="Execute CLI cmd..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const cmd = e.currentTarget.value;
                      if (!cmd.trim()) return;
                      setLogLines(prev => [...prev, `root@${activeServer?.id}*CLI> ${cmd}`, `Command executed successfully. (Mock output for: ${cmd})`].slice(-500));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto flex-1 h-full block">
                {logLines.map((line, i) => (
                  <div key={i} className={`whitespace-pre-wrap mb-1 leading-relaxed ${line.includes('ERROR') || line.includes('WARNING') ? 'text-red-400' : line.includes('Asterisk ready') || line.includes('*CLI>') ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {line}
                  </div>
                ))}
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
                className="w-full shrink-0 sticky top-4 overflow-hidden border border-sky-900/50 bg-[#0d1117] rounded-md flex flex-col h-[calc(100vh-32px)]"
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${dockerLoggerWidth}px` : '100%' }}
              >
                <div className="text-sm font-semibold text-zinc-300 p-2 bg-[#161b22] border-b border-[#30363d] flex justify-between items-center shrink-0">
                  <div className="flex items-center">
                    <span className="text-sky-400 mr-2">🐳</span>
                    <span>Docker Logs: ari-server</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded border border-border">--tail 20 -f</span>
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
