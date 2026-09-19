export type RouteType = "Outbound" | "Inbound";
export interface RawDialplan {
  productId: string;
  content: string;
}

let mockDialplans: RawDialplan[] = [
  {
    productId: "prod-1", // server-1 PJSIP IVR
    content: `[from-voip]
exten => _X.,1,NoOp(Incoming call from trunk)
 same => n,Dial(SIP/1001)

[outgoing]
exten => _X.,1,NoOp(Outgoing call to \${EXTEN})
 same => n,Set(CALLERID(num)=1596001)
 same => n,Set(CALLERID(name)=1596001)
 same => n,Dial(PJSIP/\${EXTEN}@voip-trunk)
 same => n,Hangup()

[outgoing-testing]
exten => 700,1,Answer()
 same => n,Playback(demo-congrats)
 same => n,Hangup()

[outgoing-recording]
exten => _X.,1,NoOp(Calling \${EXTEN}, playing audio, and recording)
 same => n,Set(CALLERID(num)=1596001)
 same => n,Set(CALLERID(name)=1596001)
 same => n,Answer()
 same => n,Dial(PJSIP/\${EXTEN}@voip-trunk)
 same => n,Hangup()
 same => n,NoOp(Hangup cause: \${HANGUPCAUSE})

[ari-outbound]
exten => s,1,NoOp(ARI test outbound)
 same => n,Stasis(node-ari,\${EXTEN},\${UNIQUEID})
 same => n,NoOp(Hangup cause: \${HANGUPCAUSE})
 same => n,Hangup()

[ari-dial-outbound]
exten => s,1,NoOp(Outbound call)
 same => n,Dial(PJSIP/\${ARG1},40,Stasis(ari-bridge))
 same => n,NoOp(Dial ended with \${DIALSTATUS})
 same => n,GotoIf($["\${DIALSTATUS}"="NOANSWER"]?hangup)
 same => n(hangup),Hangup()

[ari-dial-outbound-2]
exten => h,1,NoOp(Starting outbound call to \${TARGET_NUMBER})
 same => n,Dial(PJSIP/\${TARGET_NUMBER},30,Stasis(ari-bridge-2,\${TARGET_NUMBER},\${AUDIO_FILE}))
 same => n,NoOp(DIALSTATUS was \${DIALSTATUS})
 same => n,GotoIf($["\${DIALSTATUS}"="NOANSWER"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="BUSY"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CANCEL"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CHANUNAVAIL"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CONGESTION"]?hangup)
 same => n(hangup),Hangup()

[ari-dial-outbound-3]
exten => h,1,NoOp(Starting outbound call to \${TARGET_NUMBER})
 same => n,Dial(PJSIP/\${TARGET_NUMBER},30)
 same => n,Wait(1)
 same => n,AMD()
 same => n,Set(AMD_RESULT=\${AMDSTATUS})
 same => n,NoOp(DIALSTATUS was \${DIALSTATUS})
 same => n,GotoIf($["\${DIALSTATUS}"="NOANSWER"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="BUSY"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CANCEL"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CHANUNAVAIL"]?hangup)
 same => n,GotoIf($["\${DIALSTATUS}"="CONGESTION"]?hangup)
 same => n,NoOp(AMD status: \${AMDSTATUS})
 same => n,NoOp(AMD cause: \${AMDCAUSE})
 same => n,GotoIf($["\${AMDSTATUS}"="MACHINE"]?hangup)
 same => n,GotoIf($["\${AMDSTATUS}"="NOTSURE"]?hangup)
 same => n,Stasis(ari-bridge-3,\${TARGET_NUMBER},\${AUDIO_FILE},\${AMD_RESULT})
 same => n(hangup),Hangup()

[ari-dial-outbound-4]
exten => _X.,1,NoOp(Starting outbound call to \${EXTEN})
 same => n,GotoIf($["\${DIALSTATUS}"="NOANSWER"]?set_noanswer)
 same => n,GotoIf($["\${DIALSTATUS}"="BUSY"]?set_busy)
 same => n,GotoIf($["\${DIALSTATUS}"="CANCEL"]?set_cancel)
 same => n,GotoIf($["\${DIALSTATUS}"="CHANUNAVAIL"]?set_unavail)
 same => n,GotoIf($["\${DIALSTATUS}"="CONGESTION"]?set_congestion)
 same => n(run_amd),NoOp(?? Call answered, running AMD)
 same => n,Answer()
 same => n,Wait(1)
 same => n,AMD(2500,5000,1000,10000,500,200,1,256)
 same => n,NoOp(AMD Result: \${AMDSTATUS} / Cause: \${AMDCAUSE})
 same => n,Set(CHANNEL(AMDSTATUS)=\${AMDSTATUS})
 same => n,Set(CHANNEL(AMDCAUSE)=\${AMDCAUSE})
 same => n,GotoIf($["\${AMDSTATUS}"="MACHINE"]?voicemail)
 same => n,GotoIf($["\${AMDSTATUS}"="NOTSURE"]?set_notsure)
 same => n(human),NoOp(Human detected, start ARI app)
 same => n,Stasis(ari-bridge-2,\${EXTEN},\${AUDIO_FILE},human)
 same => n,Hangup()
 same => n(voicemail),NoOp(Answered by voicemail)
 same => n,Stasis(ari-bridge-2,\${EXTEN},\${AUDIO_FILE},voicemail)
 same => n,Hangup()
 same => n(set_notsure),NoOp(AMD Not Sure, treat as voicemail/human as needed)
 same => n,Stasis(ari-bridge-2,\${EXTEN},\${AUDIO_FILE},notsure)
 same => n,Hangup()
 same => n(set_noanswer),Set(HANGUPCAUSE=19)
 same => n,Goto(hangup)
 same => n(set_busy),Set(HANGUPCAUSE=17)
 same => n,Goto(hangup)
 same => n(set_cancel),Set(HANGUPCAUSE=21)
 same => n,Goto(hangup)
 same => n(set_unavail),Set(HANGUPCAUSE=1)
 same => n,Goto(hangup)
 same => n(set_congestion),Set(HANGUPCAUSE=34)
 same => n,Goto(hangup)
 same => n(set_machine),Set(HANGUPCAUSE=16)
 same => n,Goto(hangup)
 same => n(hangup),Hangup()

[from-trunk-2]
exten => _X.,1,NoOp(Incoming call from trunk 2)
 same => n,Dial(SIP/1001)

[outbound-2]
exten => _X.,1,NoOp(Call sent to ARI IVR)
 same => n,Stasis(node-ari-2)
 same => n,Hangup()

[dari-calldial]
exten => 8888,1,NoOp(Ada telepon masuk dari Calldial!)
 same => n,Set(CALLERID(num)=6281234567890)
 same => n,Set(CALLERID(name)=Test CallerID)
 same => n,Answer()
 same => n,Playback(hello-world)
 same => n,Dial(PJSIP/67332082386092523@voip-trunk-dial,60)
 same => n,Hangup()`
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const routingApi = {
  getDialplan: async (productId: string): Promise<RawDialplan> => {
    await delay(300);
    const dp = mockDialplans.find(d => d.productId === productId);
    if (dp) return { ...dp };
    return { productId, content: "" };
  },
  
  getAllDialplansForServer: async (productIds: string[]): Promise<RawDialplan[]> => {
    await delay(200);
    return mockDialplans.filter(d => productIds.includes(d.productId));
  },
  
  updateDialplan: async (productId: string, content: string): Promise<RawDialplan> => {
    await delay(500);
    const index = mockDialplans.findIndex(d => d.productId === productId);
    if (index === -1) {
      const newDp = { productId, content };
      mockDialplans.push(newDp);
      return newDp;
    }
    mockDialplans[index].content = content;
    return { ...mockDialplans[index] };
  },
};
