import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import net from "net";

// Helper function to check if a TCP port is open
const checkPort = (host: string, port: number, timeoutMs = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing server ID" }, { status: 400 });
    }

    const server = await prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      return NextResponse.json({ success: false, error: "Server not found" }, { status: 404 });
    }

    // Check SSH port (22) for Server Status
    const serverUp = await checkPort(server.ip, 22);
    
    // Check AMI port (default 5038) for Asterisk Status
    const amiHost = server.amiHost || server.ip;
    const asteriskUp = await checkPort(amiHost, server.port || 5038);

    return NextResponse.json({
      success: true,
      serverUp,
      asteriskUp,
    });
  } catch (error: any) {
    console.error("Failed to check server status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
