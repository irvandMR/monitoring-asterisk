"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useServerContext } from "./server-context";

interface AmiContextType {
  isConnected: boolean;
  endpoints: any[];
  contacts: any[];
  channels: any[];
  registrations: any[];
  logs: string[];
  clearLogs: () => void;
  addLog: (log: string) => void;
}

const AmiContext = createContext<AmiContextType | undefined>(undefined);

export function AmiProvider({ children }: { children: ReactNode }) {
  const { activeServer } = useServerContext();
  const [isConnected, setIsConnected] = useState(false);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((log: string) => {
    setLogs((prev) => {
      const newLogs = [...prev, `[${new Date().toISOString()}] ${log}`];
      return newLogs.slice(-500); // Keep last 500 lines
    });
  }, []);

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    if (!activeServer) {
      setIsConnected(false);
      return;
    }

    addLog(`Initiating AMI connection to ${activeServer.name} (${activeServer.ip})...`);
    
    // Reset state on new connection
    setEndpoints([]);
    setContacts([]);
    setChannels([]);
    setRegistrations([]);
    
    const eventSource = new EventSource(`/api/ami?serverId=${activeServer.id}`);

    eventSource.addEventListener("connected", async (e) => {
      setIsConnected(true);
      const data = JSON.parse(e.data);
      addLog(`[System] ${data.message}`);
    });

    eventSource.addEventListener("disconnected", (e) => {
      setIsConnected(false);
      const data = JSON.parse(e.data);
      addLog(`[System] ${data.message}`);
    });

    eventSource.addEventListener("error", (e) => {
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          addLog(`[Error] ${data.message}`);
        } catch (err) {}
      } else {
        addLog(`[Error] EventSource connection lost or failed to connect.`);
      }
      setIsConnected(false);
    });

    eventSource.addEventListener("ami_event", (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.Event !== "VarSet" && data.Event !== "RTCPSent" && data.Event !== "RTCPReceived" && data.Event !== "SuccessfulAuth") {
           addLog(`[Event] ${data.Event}: ${JSON.stringify(data)}`);
        }

        switch (data.Event) {
          case "EndpointList":
          case "EndpointDetail":
          case "PeerStatus":
            setEndpoints(prev => {
              const existing = prev.findIndex(p => 
                (data.Endpoint && p.Endpoint === data.Endpoint) || 
                (data.ObjectName && p.ObjectName === data.ObjectName) || 
                (data.Peer && p.Peer === data.Peer)
              );
              if (existing >= 0) {
                const copy = [...prev];
                copy[existing] = { ...copy[existing], ...data };
                return copy;
              }
              return [...prev, data];
            });
            break;
            
          case "ContactList":
          case "ContactStatus":
            setContacts(prev => {
              const existing = prev.findIndex(c => c.ObjectName === data.ObjectName || c.URI === data.URI);
              if (existing >= 0) {
                const copy = [...prev];
                copy[existing] = { ...copy[existing], ...data };
                return copy;
              }
              return [...prev, data];
            });
            break;

          case "CoreShowChannel":
          case "Newchannel":
            setChannels(prev => {
              if (prev.some(c => c.Uniqueid === data.Uniqueid)) {
                // update existing channel state
                return prev.map(c => c.Uniqueid === data.Uniqueid ? { ...c, ...data } : c);
              }
              return [...prev, data];
            });
            break;
            
          case "Hangup":
            setChannels(prev => prev.filter(c => c.Uniqueid !== data.Uniqueid));
            break;
            
          case "OutboundRegistrationDetail":
          case "Registry":
            setRegistrations(prev => {
              const existing = prev.findIndex(r => 
                (data.Username && r.Username === data.Username && data.Domain && r.Domain === data.Domain) ||
                (data.ObjectName && r.ObjectName === data.ObjectName)
              );
              if (existing >= 0) {
                const copy = [...prev];
                copy[existing] = { ...copy[existing], ...data };
                return copy;
              }
              return [...prev, data];
            });
            break;
        }
      } catch (err) {
        console.error("Failed to parse ami_event", err);
      }
    });

    return () => {
      addLog(`Closing connection to ${activeServer.name}...`);
      eventSource.close();
      setIsConnected(false);
    };
  }, [activeServer, addLog]);

  return (
    <AmiContext.Provider
      value={{
        isConnected,
        endpoints,
        contacts,
        channels,
        registrations,
        logs,
        clearLogs,
        addLog,
      }}
    >
      {children}
    </AmiContext.Provider>
  );
}

export function useAmiContext() {
  const context = useContext(AmiContext);
  if (context === undefined) {
    throw new Error("useAmiContext must be used within an AmiProvider");
  }
  return context;
}
