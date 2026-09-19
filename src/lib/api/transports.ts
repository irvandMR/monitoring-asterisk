export interface Transport {
  id: string;
  name: string; // e.g. transport-udp, transport-wss
  protocol: "udp" | "tcp" | "ws" | "wss" | "tls";
  bind: string; // e.g. 0.0.0.0:5060
  localNet?: string; // e.g. 192.168.1.0/24
  externalSignalingAddress?: string;
  externalMediaAddress?: string;
  serverId: string;
}

let transports: Transport[] = [
  {
    id: "transport-1",
    name: "transport-udp",
    protocol: "udp",
    bind: "0.0.0.0:5060",
    localNet: "172.18.0.0/16",
    externalSignalingAddress: "8.215.76.108",
    externalMediaAddress: "8.215.76.108",
    serverId: "192.168.10.11",
  },
  {
    id: "transport-2",
    name: "transport-tcp",
    protocol: "tcp",
    bind: "0.0.0.0",
    serverId: "192.168.10.11",
  },
  {
    id: "transport-3",
    name: "transport-wss",
    protocol: "wss",
    bind: "0.0.0.0:8089",
    localNet: "172.18.15.194/18",
    externalSignalingAddress: "8.215.48.57",
    externalMediaAddress: "8.215.48.57",
    serverId: "192.168.10.11",
  },
  {
    id: "transport-4",
    name: "transport-udp",
    protocol: "udp",
    bind: "0.0.0.0:5060",
    localNet: "172.17.0.0/16",
    externalSignalingAddress: "149.129.218.243",
    externalMediaAddress: "149.129.218.243",
    serverId: "10.0.0.50",
  },
  {
    id: "transport-5",
    name: "transport-udp-mobile",
    protocol: "udp",
    bind: "0.0.0.0:5551",
    localNet: "172.17.0.0/16",
    externalSignalingAddress: "149.129.218.243",
    externalMediaAddress: "149.129.218.243",
    serverId: "10.0.0.50",
  },
  {
    id: "transport-6",
    name: "transport-wss",
    protocol: "wss",
    bind: "0.0.0.0:8443",
    externalSignalingAddress: "149.129.218.243",
    externalMediaAddress: "149.129.218.243",
    serverId: "10.0.0.50",
  },
  {
    id: "transport-7",
    name: "transport-tls",
    protocol: "tls",
    bind: "0.0.0.0:5061",
    localNet: "172.17.0.0/16",
    externalSignalingAddress: "149.129.218.243",
    externalMediaAddress: "149.129.218.243",
    serverId: "10.0.0.50",
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const transportApi = {
  getTransports: async (): Promise<Transport[]> => {
    await delay(300);
    return [...transports];
  },
  
  createTransport: async (data: Omit<Transport, "id">): Promise<Transport> => {
    await delay(500);
    const newTransport: Transport = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
    };
    transports.push(newTransport);
    return newTransport;
  },

  updateTransport: async (id: string, data: Partial<Omit<Transport, "id">>): Promise<Transport> => {
    await delay(500);
    const index = transports.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Transport not found");
    
    transports[index] = { ...transports[index], ...data };
    return transports[index];
  },

  deleteTransport: async (id: string): Promise<void> => {
    await delay(400);
    transports = transports.filter((t) => t.id !== id);
  },
};
