export interface GlobalSettings {
  serverId: string;
  use_q850_reason: boolean;
  debug: boolean;
  allowoverlap: boolean;
  bindaddr: string;
  external_media_address: string;
  external_signaling_address: string;
  local_net: string;
  customFields?: { key: string; value: string }[];
}

let globalSettingsData: GlobalSettings[] = [
  {
    serverId: "server-1",
    use_q850_reason: true,
    debug: true,
    allowoverlap: false,
    bindaddr: "0.0.0.0",
    external_media_address: "8.215.76.108",
    external_signaling_address: "8.215.76.108",
    local_net: "172.18.0.0/18",
    customFields: [{ key: "user_agent", value: "PBX-Dashboard" }],
  },
  {
    serverId: "192.168.10.11",
    use_q850_reason: true,
    debug: true,
    allowoverlap: false,
    bindaddr: "0.0.0.0",
    local_net: "172.18.0.0/18",
    external_media_address: "8.215.76.108",
    external_signaling_address: "8.215.76.108",
    customFields: [],
  },
  {
    serverId: "10.0.0.50",
    use_q850_reason: true,
    debug: false,
    allowoverlap: false,
    bindaddr: "0.0.0.0",
    external_media_address: "103.10.10.1",
    external_signaling_address: "103.10.10.1",
    local_net: "192.168.1.0/24",
    customFields: [],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const globalApi = {
  getSettings: async (serverId: string): Promise<GlobalSettings> => {
    await delay(300);
    const settings = globalSettingsData.find((s) => s.serverId === serverId);
    if (settings) return { ...settings };
    
    // Return defaults if not found
    return {
      serverId,
      use_q850_reason: true,
      debug: false,
      allowoverlap: false,
      bindaddr: "0.0.0.0",
      external_media_address: "",
      external_signaling_address: "",
      local_net: "",
      customFields: [],
    };
  },
  
  updateSettings: async (serverId: string, data: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    await delay(500);
    const index = globalSettingsData.findIndex((s) => s.serverId === serverId);
    if (index === -1) {
      const newSettings = { ...data, serverId } as GlobalSettings;
      globalSettingsData.push(newSettings);
      return newSettings;
    }
    
    globalSettingsData[index] = { ...globalSettingsData[index], ...data };
    return globalSettingsData[index];
  },
};
