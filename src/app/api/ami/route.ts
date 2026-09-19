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
      });

      client.on("event", (event: any) => {
        sendEvent("ami_event", event);
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
        console.log(`[AMI] Attempting connection to ${server.ip}:${server.port}`);
        client.connect(server.amiUsername, server.amiPassword, {
          host: server.ip,
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
