import { prisma } from "@/lib/db";
import { Client } from "ssh2";
import fs from "fs";
import os from "os";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const container = searchParams.get("container");

  if (!serverId || !container) {
    return new Response("Missing serverId or container name", { status: 400 });
  }

  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server || !server.sshUsername) {
    return new Response("Server not found or missing SSH credentials", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const conn = new Client();

      const sendEvent = (event: string, data: any) => {
        try {
          const formatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(formatted));
        } catch (e) {
          // Stream might be closed
        }
      };

      let privateKey;
      try {
        if (server.sshKey) privateKey = server.sshKey;
        else privateKey = fs.readFileSync(os.homedir() + "/.ssh/id_ed25519");
      } catch (e) {}

      conn.on("ready", () => {
        sendEvent("connected", { message: `[SYSTEM] Connected to ${server.ip} via SSH...` });
        
        // Check if sudo is needed, assuming yes for docker
        conn.exec(`sudo docker logs --tail 100 -f ${container}`, (err, stream) => {
          if (err) {
            sendEvent("error", { message: err.message });
            conn.end();
            return;
          }

          stream.on("data", (data: any) => {
            const lines = data.toString().split("\n");
            lines.forEach((l: string) => {
               if (l.trim()) sendEvent("log", l.trim());
            });
          }).stderr.on("data", (data: any) => {
            const lines = data.toString().split("\n");
            lines.forEach((l: string) => {
               if (l.trim()) sendEvent("log", l.trim());
            });
          }).on("close", () => {
            sendEvent("closed", { message: "[SYSTEM] Docker logs stream closed." });
            conn.end();
          });
        });
      }).on("error", (err) => {
        sendEvent("error", { message: "[SYSTEM SSH ERROR] " + err.message });
      }).connect({
        host: server.ip,
        port: 22,
        username: server.sshUsername,
        password: server.sshPassword || undefined,
        privateKey: privateKey,
        keepaliveInterval: 10000
      });

      // Cleanup when browser closes the connection
      req.signal.addEventListener("abort", () => {
        conn.end();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
