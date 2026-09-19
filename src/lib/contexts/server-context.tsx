"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export interface AsteriskServer {
  id: string;
  name: string;
  ip: string;
  port?: number;
  isActive?: boolean;
  amiUsername?: string;
  amiPassword?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshKey?: string;
}

export interface ServerStatus {
  serverUp: boolean;
  asteriskUp: boolean;
  lastChecked: number;
}

interface ServerContextType {
  servers: AsteriskServer[];
  activeServer: AsteriskServer | null;
  isLoading: boolean;
  setActiveServer: (server: AsteriskServer) => void;
  reloadServers: () => Promise<void>;
  addServer: (data: Partial<AsteriskServer> & { name: string; ip: string }) => Promise<{ success: boolean; error?: string }>;
  updateServer: (id: string, data: Partial<AsteriskServer>) => Promise<{ success: boolean; error?: string }>;
  deleteServer: (id: string) => Promise<{ success: boolean; error?: string }>;
  serverStatuses: Record<string, ServerStatus>;
  checkServerStatus: (id: string) => Promise<void>;
  checkAllServers: () => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [servers, setServers] = useState<AsteriskServer[]>([]);
  const [activeServer, setActiveServerState] = useState<AsteriskServer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});

  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch("/api/servers");
      if (!res.ok) throw new Error("Failed to load servers");
      const data = await res.json();
      if (data.success && Array.isArray(data.servers)) {
        setServers(data.servers);
        setActiveServerState((prev) => {
          if (!prev) return data.servers[0] || null;
          const found = data.servers.find((s: AsteriskServer) => s.id === prev.id);
          return found || data.servers[0] || null;
        });
      }
    } catch (err) {
      console.error("Gagal mengambil data server dari database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const checkServerStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/servers/status?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setServerStatuses((prev) => ({
          ...prev,
          [id]: {
            serverUp: data.serverUp,
            asteriskUp: data.asteriskUp,
            lastChecked: Date.now(),
          },
        }));
      }
    } catch (err) {
      console.error(`Failed to check status for server ${id}`, err);
    }
  }, []);

  const checkAllServers = useCallback(async () => {
    if (servers.length === 0) return;
    await Promise.all(servers.map((s) => checkServerStatus(s.id)));
  }, [servers, checkServerStatus]);

  useEffect(() => {
    if (servers.length > 0) {
      checkAllServers();
    }
  }, [servers, checkAllServers]);

  const setActiveServer = (server: AsteriskServer) => {
    setActiveServerState(server);
  };

  const addServer = async (data: Partial<AsteriskServer> & { name: string; ip: string }) => {
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Gagal menambah server" };
      }
      await fetchServers();
      setActiveServerState(result.server);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const updateServer = async (id: string, data: Partial<AsteriskServer>) => {
    try {
      const res = await fetch("/api/servers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Gagal mengubah server" };
      }
      await fetchServers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const res = await fetch(`/api/servers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Gagal menghapus server" };
      }
      await fetchServers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  return (
    <ServerContext.Provider
      value={{
        servers,
        activeServer,
        isLoading,
        setActiveServer,
        reloadServers: fetchServers,
        addServer,
        updateServer,
        deleteServer,
        serverStatuses,
        checkServerStatus,
        checkAllServers,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServerContext() {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error("useServerContext must be used within a ServerProvider");
  }
  return context;
}
