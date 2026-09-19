export type PjsipObjectType = "endpoint" | "aor" | "auth" | "registration" | "identify";

export interface PjsipObject {
  id: string;
  productId?: string;
  serverId?: string;
  type: PjsipObjectType;
  name: string; // The bracketed name e.g. [1001] or [voip-trunk]
  isTemplate?: boolean;
  inherits?: string;
  fields: { key: string; value: string }[];
}

let mockObjects: PjsipObject[] = [
  // 1001 Endpoint
  { id: "obj-1001-ep", productId: "prod-1", type: "endpoint", name: "1001", fields: [
    { key: "transport", value: "transport-tcp" },
    { key: "aors", value: "1001" },
    { key: "auth", value: "auth1001" },
    { key: "context", value: "internal" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "opus,ulaw,alaw,g722" },
    { key: "direct_media", value: "no" },
    { key: "ice_support", value: "no" },
    { key: "webrtc", value: "no" },
    { key: "media_encryption", value: "dtls" },
    { key: "rewrite_contact", value: "yes" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "force_rport", value: "yes" },
    { key: "dtls_verify", value: "fingerprint" },
    { key: "dtls_rekey", value: "0" },
    { key: "media_use_received_transport", value: "yes" },
  ]},
  { id: "obj-1001-auth", productId: "prod-1", type: "auth", name: "auth1001", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "1001" },
    { key: "password", value: "1234" },
  ]},
  { id: "obj-1001-aor", productId: "prod-1", type: "aor", name: "1001", fields: [
    { key: "max_contacts", value: "1" },
    { key: "remove_existing", value: "yes" },
  ]},

  // 1002 Endpoint
  { id: "obj-1002-ep", productId: "prod-1", type: "endpoint", name: "1002", fields: [
    { key: "transport", value: "transport-wss" },
    { key: "aors", value: "1002" },
    { key: "auth", value: "1002" },
    { key: "context", value: "outgoing-testing" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "opus,ulaw,alaw" },
    { key: "media_encryption", value: "dtls" },
    { key: "dtls_verify", value: "fingerprint" },
    { key: "dtls_setup", value: "actpass" },
    { key: "webrtc", value: "yes" },
    { key: "rtcp_mux", value: "yes" },
    { key: "ice_support", value: "yes" },
    { key: "media_use_received_transport", value: "yes" },
    { key: "direct_media", value: "no" },
    { key: "use_avpf", value: "yes" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "rewrite_contact", value: "yes" },
    { key: "force_rport", value: "yes" },
    { key: "media_address", value: "172.18.15.194" },
  ]},
  { id: "obj-1002-auth", productId: "prod-1", type: "auth", name: "1002", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "1002" },
    { key: "password", value: "5678" },
  ]},
  { id: "obj-1002-aor", productId: "prod-1", type: "aor", name: "1002", fields: [
    { key: "max_contacts", value: "1" },
    { key: "remove_existing", value: "yes" },
  ]},

  // 700 Endpoint
  { id: "obj-700-ep", productId: "prod-1", type: "endpoint", name: "700", fields: [
    { key: "context", value: "outgoing-testing" },
  ]},

  // VOIP Trunk
  { id: "obj-voip-trunk-ep", productId: "prod-1", type: "endpoint", name: "voip-trunk", fields: [
    { key: "transport", value: "transport-udp" },
    { key: "aors", value: "voip-trunk-aor" },
    { key: "context", value: "from-voip" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "ulaw,alaw" },
    { key: "direct_media", value: "no" },
    { key: "callerid", value: "2130274797<2130274797>" },
    { key: "from_user", value: "2130274797" },
    { key: "from_domain", value: "119.47.88.165" },
    { key: "trust_id_inbound", value: "yes" },
    { key: "trust_id_outbound", value: "yes" },
    { key: "send_pai", value: "yes" },
    { key: "send_rpid", value: "yes" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "rewrite_contact", value: "yes" },
    { key: "force_rport", value: "yes" },
  ]},
  { id: "obj-voip-trunk-aor", productId: "prod-1", type: "aor", name: "voip-trunk-aor", fields: [
    { key: "contact", value: "sip:119.47.88.165" },
  ]},
  { id: "obj-voip-trunk-id", productId: "prod-1", type: "identify", name: "voip-trunk-identify", fields: [
    { key: "endpoint", value: "voip-trunk" },
    { key: "match", value: "119.47.88.165" },
  ]},

  // VOIP Trunk DIAL
  { id: "obj-voip-trunk-dial-ep", productId: "prod-1", type: "endpoint", name: "voip-trunk-dial", fields: [
    { key: "transport", value: "transport-udp" },
    { key: "aors", value: "voip-trunk-dial-aor" },
    { key: "outbound_auth", value: "voip-trunk-auth" },
    { key: "context", value: "ari-dial-outbound-4" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "alaw" },
    { key: "direct_media", value: "no" },
    { key: "callerid", value: "" },
    { key: "from_user", value: "" },
    { key: "from_domain", value: "103.84.193.94" },
    { key: "trust_id_inbound", value: "yes" },
    { key: "trust_id_outbound", value: "yes" },
    { key: "send_pai", value: "yes" },
    { key: "send_rpid", value: "yes" },
    { key: "inband_progress", value: "no" },
  ]},
  { id: "obj-voip-trunk-dial-aor", productId: "prod-1", type: "aor", name: "voip-trunk-dial-aor", fields: [
    { key: "contact", value: "sip:103.84.193.94" },
  ]},
  { id: "obj-voip-trunk-dial-id", productId: "prod-1", type: "identify", name: "voip-trunk-dial-id", fields: [
    { key: "endpoint", value: "voip-trunk-dial" },
    { key: "match", value: "103.84.193.94" },
  ]},

  // VOIP Trunk DIAL 03
  { id: "obj-voip-trunk-dial-03-ep", productId: "prod-1", type: "endpoint", name: "voip-trunk-dial-03", fields: [
    { key: "transport", value: "transport-udp" },
    { key: "outbound_auth", value: "voip-trunk-auth-03" },
    { key: "aors", value: "voip-trunk-dial-aor-03" },
    { key: "context", value: "ari-dial-outbound-5" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "alaw" },
    { key: "direct_media", value: "no" },
    { key: "from_domain", value: "103.52.146.118" },
    { key: "trust_id_inbound", value: "yes" },
    { key: "trust_id_outbound", value: "yes" },
    { key: "send_pai", value: "yes" },
    { key: "send_rpid", value: "yes" },
    { key: "dtmf_mode", value: "auto_info" },
  ]},
  { id: "obj-voip-trunk-dial-aor-03", productId: "prod-1", type: "aor", name: "voip-trunk-dial-aor-03", fields: [
    { key: "contact", value: "sip:103.52.146.118" },
  ]},
  { id: "obj-voip-trunk-dial-id-03", productId: "prod-1", type: "identify", name: "voip-trunk-dial-id-03", fields: [
    { key: "endpoint", value: "voip-trunk-dial-03" },
    { key: "match", value: "103.52.146.118" },
  ]},

  // Registrations
  { id: "obj-reg-1", productId: "prod-1", type: "registration", name: "voip-trunk-reg", fields: [
    { key: "outbound_auth", value: "voip-trunk-auth" },
    { key: "server_uri", value: "sip:119.47.88.165" },
    { key: "client_uri", value: "sip:2130274797@119.47.88.165" },
    { key: "contact_user", value: "2130274797" },
    { key: "retry_interval", value: "60" },
    { key: "forbidden_retry_interval", value: "600" },
    { key: "expiration", value: "3600" },
    { key: "auth_rejection_permanent", value: "no" },
  ]},
  { id: "obj-reg-03", productId: "prod-1", type: "registration", name: "voip-trunk-reg-03", fields: [
    { key: "transport", value: "transport-udp" },
    { key: "outbound_auth", value: "voip-trunk-auth-03" },
    { key: "server_uri", value: "sip:103.52.146.118" },
    { key: "client_uri", value: "sip:889923072026003@103.52.146.118" },
    { key: "contact_user", value: "889923072026003" },
    { key: "retry_interval", value: "60" },
    { key: "forbidden_retry_interval", value: "600" },
    { key: "expiration", value: "3600" },
    { key: "auth_rejection_permanent", value: "no" },
  ]},

  // Auths
  { id: "obj-auth-1", productId: "prod-1", type: "auth", name: "voip-trunk-auth", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "2130274797" },
    { key: "password", value: "M2jVd$!odpHvcl" },
  ]},
  { id: "obj-auth-03", productId: "prod-1", type: "auth", name: "voip-trunk-auth-03", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "889923072026003" },
    { key: "password", value: "WNX21GkD" },
  ]},

  // Calldial Server
  { id: "obj-cd-ep", productId: "prod-1", type: "endpoint", name: "calldial-server", fields: [
    { key: "transport", value: "transport-udp" },
    { key: "context", value: "dari-calldial" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "alaw,ulaw,opus" },
    { key: "direct_media", value: "no" },
  ]},
  { id: "obj-cd-aor", productId: "prod-1", type: "aor", name: "calldial-server", fields: [
    { key: "contact", value: "sip:147.139.193.218:5060" },
  ]},
  { id: "obj-cd-id", productId: "prod-1", type: "identify", name: "calldial-server", fields: [
    { key: "endpoint", value: "calldial-server" },
    { key: "match", value: "147.139.193.218" },
  ]},

  // ==========================================
  // SERVER 5: GLOBAL TEMPLATES
  // ==========================================
  { id: "obj-s5-tpl-webrtc", serverId: "10.0.0.50", type: "endpoint", name: "webrtc-template", isTemplate: true, fields: [
    { key: "transport", value: "transport-wss" },
    { key: "context", value: "outgoing-calldial" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "ulaw,alaw" },
    { key: "media_encryption", value: "dtls" },
    { key: "dtls_verify", value: "no" },
    { key: "dtls_setup", value: "actpass" },
    { key: "webrtc", value: "yes" },
    { key: "rtcp_mux", value: "yes" },
    { key: "ice_support", value: "yes" },
    { key: "media_use_received_transport", value: "yes" },
    { key: "direct_media", value: "no" },
    { key: "use_avpf", value: "yes" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "rewrite_contact", value: "yes" },
    { key: "force_rport", value: "yes" },
    { key: "dtls_cert_file", value: "/etc/letsencrypt/live/api-dial.neokarya.co.id/fullchain.pem" },
    { key: "dtls_private_key", value: "/etc/letsencrypt/live/api-dial.neokarya.co.id/privkey.pem" },
    { key: "identify_by", value: "username" },
    { key: "dtmf_mode", value: "auto_info" },
  ]},
  { id: "obj-s5-tpl-mobile", serverId: "10.0.0.50", type: "endpoint", name: "softphone-template", isTemplate: true, fields: [
    { key: "transport", value: "transport-udp-mobile" },
    { key: "context", value: "outgoing-calldial" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "ulaw,alaw" },
    { key: "direct_media", value: "no" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "rewrite_contact", value: "yes" },
    { key: "force_rport", value: "yes" },
    { key: "ice_support", value: "yes" },
    { key: "rtcp_mux", value: "yes" },
    { key: "rtp_keepalive", value: "15" },
  ]},

  // ==========================================
  // SERVER 5: CALL-TO-DIAL
  // ==========================================
  { id: "obj-s5-ep-1001", productId: "prod-5-ctd", type: "endpoint", name: "1001", inherits: "webrtc-template", fields: [
    { key: "aors", value: "1001" },
    { key: "auth", value: "1001" },
  ]},
  { id: "obj-s5-auth-1001", productId: "prod-5-ctd", type: "auth", name: "1001", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "1001" },
    { key: "password", value: "rahasia123" },
  ]},
  { id: "obj-s5-aor-1001", productId: "prod-5-ctd", type: "aor", name: "1001", fields: [
    { key: "max_contacts", value: "1" },
    { key: "remove_existing", value: "yes" },
  ]},
  // (Mobile template moved to global)
  
  // ==========================================
  // SERVER 5: WhatsApp Meta (prod-5-ctd)
  // ==========================================
  { id: "obj-wa-id", productId: "prod-5-ctd", type: "identify", name: "whatsapp-meta-identify", fields: [
    { key: "endpoint", value: "whatsapp-meta" },
    { key: "match_header", value: "X-FB-External-Domain: wa.meta.vc" },
  ]},
  { id: "obj-wa-ep", productId: "prod-5-ctd", type: "endpoint", name: "whatsapp-meta", fields: [
    { key: "transport", value: "transport-tls" },
    { key: "context", value: "from-whatsapp" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "opus,alaw,ulaw" },
    { key: "direct_media", value: "no" },
    { key: "use_avpf", value: "yes" },
    { key: "rtp_symmetric", value: "yes" },
    { key: "force_rport", value: "yes" },
    { key: "auth", value: "whatsapp-meta-auth" },
    { key: "outbound_auth", value: "whatsapp-meta-auth" },
    { key: "media_encryption", value: "sdes" },
    { key: "aors", value: "whatsapp-meta-aor" },
  ]},
  { id: "obj-wa-aor", productId: "prod-5-ctd", type: "aor", name: "whatsapp-meta-aor", fields: [
    { key: "max_contacts", value: "1" },
    { key: "contact", value: "sip:wa.meta.vc:5061" },
  ]},
  { id: "obj-wa-auth", productId: "prod-5-ctd", type: "auth", name: "whatsapp-meta-auth", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "6282321220330" },
    { key: "password", value: "NZaCVHKGeaUvFKPHmQ583SylP0ocohOO" },
  ]},

  // ==========================================
  // SERVER 5: DeskCall (Dial Koor 220*)
  // ==========================================
  { id: "obj-desk-ep-1", productId: "prod-5-desk", type: "endpoint", name: "220121363", inherits: "webrtc-template", fields: [
    { key: "aors", value: "220121363" },
    { key: "auth", value: "220121363" },
  ]},
  { id: "obj-desk-auth-1", productId: "prod-5-desk", type: "auth", name: "220121363", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "220121363" },
    { key: "password", value: "Pass220121363" },
  ]},
  { id: "obj-desk-aor-1", productId: "prod-5-desk", type: "aor", name: "220121363", fields: [
    { key: "max_contacts", value: "1" },
    { key: "remove_existing", value: "yes" },
  ]},

  // ==========================================
  // SERVER 5: Predictive (113*)
  // ==========================================
  { id: "obj-pred-ep-1", productId: "prod-5-pred", type: "endpoint", name: "11300001", inherits: "webrtc-template", fields: [
    { key: "aors", value: "11300001" },
    { key: "auth", value: "11300001" },
  ]},
  { id: "obj-pred-auth-1", productId: "prod-5-pred", type: "auth", name: "11300001", fields: [
    { key: "auth_type", value: "userpass" },
    { key: "username", value: "11300001" },
    { key: "password", value: "Pass11300001" },
  ]},
  { id: "obj-pred-aor-1", productId: "prod-5-pred", type: "aor", name: "11300001", fields: [
    { key: "max_contacts", value: "1" },
    { key: "remove_existing", value: "yes" },
  ]}
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pjsipObjectApi = {
  getObjects: async (productId: string, type?: PjsipObjectType): Promise<PjsipObject[]> => {
    await delay(300);
    let results = mockObjects.filter(o => o.productId === productId);
    if (type) {
      results = results.filter(o => o.type === type);
    }
    return results;
  },

  getAllObjectsForServer: async (productIds: string[], serverId?: string): Promise<PjsipObject[]> => {
    await delay(300);
    return mockObjects.filter(o => (o.productId && productIds.includes(o.productId)) || (o.serverId === serverId));
  },

  getTemplatesForServer: async (serverId: string, type?: string): Promise<PjsipObject[]> => {
    await delay(300);
    return mockObjects.filter(o => o.serverId === serverId && o.isTemplate && (!type || o.type === type));
  },

  createObject: async (data: Omit<PjsipObject, "id">): Promise<PjsipObject> => {
    await delay(400);
    const newObj = { ...data, id: `obj-${Date.now()}` };
    mockObjects.push(newObj);
    return newObj;
  },

  updateObject: async (id: string, data: Partial<PjsipObject>): Promise<PjsipObject> => {
    await delay(400);
    const index = mockObjects.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Object not found");
    mockObjects[index] = { ...mockObjects[index], ...data };
    return mockObjects[index];
  },

  deleteObject: async (id: string): Promise<void> => {
    await delay(400);
    mockObjects = mockObjects.filter(o => o.id !== id);
  },
};
