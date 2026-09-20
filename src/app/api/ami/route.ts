import { prisma } from "@/lib/db";
// @ts-ignore
import AmiClient from "asterisk-ami-client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return new Response("Missing serverId", { status: 400 });
  }

  const server = await prisma.server.findUnique({ where: { id: serverId } });

  if (!server) {
    return new Response("Server not found", { status: 404 });
  }

  if (!server.amiUsername || !server.amiPassword) {
    return new Response("AMI credentials not set for this server", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          const formatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(formatted));
        } catch (e) {
          // Stream might be closed
        }
      };

      const client = new AmiClient({
        reconnect: false,
        keepAlive: true,
        emitEventsByTypes: true,
      });

      client.on("connect", () => {
        console.log(`[AMI] Connected to ${server.ip}`);
        sendEvent("connected", { message: `Connected to ${server.ip}` });
        
        // Auto-fetch data on this persistent connection so events flow to SSE
        setTimeout(() => {
          client.action({ Action: 'PJSIPShowEndpoints' });
          client.action({ Action: 'PJSIPShowContacts' });
          client.action({ Action: 'CoreShowChannels' });
          client.action({ Action: 'PJSIPShowRegistrationsOutbound' });
        }, 1000);
      });

      client.on("event", (event: any) => {
        sendEvent("ami_event", event);
      });

      client.on("response", (response: any) => {
        // Forward responses to frontend for debugging
        sendEvent("ami_event", { Event: 'Response', ...response });
      });

      client.on("disconnect", () => {
        console.log(`[AMI] Disconnected from ${server.ip}`);
        sendEvent("disconnected", { message: "Disconnected" });
        try {
          controller.close();
        } catch (e) {}
      });

      client.on("internalError", (error: any) => {
        console.error(`[AMI Error]`, error);
        sendEvent("error", { message: error?.message || "Internal AMI Error" });
      });

      // Cleanup when client disconnects (e.g. closes browser tab)
      req.signal.addEventListener("abort", () => {
        console.log(`[AMI] Client aborted connection to ${server.ip}`);
        client.disconnect();
      });

      try {
        const amiHost = server.amiHost || server.ip;
        console.log(`[AMI] Attempting connection to ${amiHost}:${server.port}`);
        client.connect(server.amiUsername, server.amiPassword, {
          host: amiHost,
          port: server.port || 5038,
        });
      } catch (err: any) {
        console.error(`[AMI Connection Failed]`, err);
        sendEvent("error", { message: err.message || "Connection failed" });
        try {
          controller.close();
        } catch (e) {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
