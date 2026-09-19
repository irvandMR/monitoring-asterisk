import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/servers - List all active servers
export async function GET() {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, servers });
  } catch (error: any) {
    console.error("Failed to fetch servers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch servers" },
      { status: 500 }
    );
  }
}

// POST /api/servers - Create a new server
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ip, port = 5038, amiUsername, amiPassword, sshUsername, sshPassword } = body;

    if (!name || !ip) {
      return NextResponse.json(
        { success: false, error: "Nama server dan IP address wajib diisi" },
        { status: 400 }
      );
    }

    // Check duplicate IP
    const existing = await prisma.server.findUnique({
      where: { ip },
    });

    if (existing) {
      if (!existing.isActive) {
        // Re-activate
        const reactivated = await prisma.server.update({
          where: { id: existing.id },
          data: {
            name,
            port: Number(port) || 5038,
            isActive: true,
            amiUsername,
            amiPassword,
            sshUsername,
            sshPassword,
          },
        });
        return NextResponse.json({ success: true, server: reactivated });
      }
      return NextResponse.json(
        { success: false, error: `IP ${ip} sudah terdaftar pada server "${existing.name}"` },
        { status: 409 }
      );
    }

    const server = await prisma.server.create({
      data: {
        name,
        ip,
        port: Number(port) || 5038,
        amiUsername,
        amiPassword,
        sshUsername,
        sshPassword,
      },
    });

    return NextResponse.json({ success: true, server }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create server:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create server" },
      { status: 500 }
    );
  }
}

// PUT /api/servers - Update an existing server
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, ip, port, amiUsername, amiPassword, sshUsername, sshPassword } = body;

    if (!id || !name || !ip) {
      return NextResponse.json(
        { success: false, error: "ID, Nama, dan IP server wajib diisi" },
        { status: 400 }
      );
    }

    // Check if IP is used by another server
    const duplicate = await prisma.server.findFirst({
      where: {
        ip,
        id: { not: id },
        isActive: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `IP ${ip} sudah digunakan oleh server "${duplicate.name}"` },
        { status: 409 }
      );
    }

    const updated = await prisma.server.update({
      where: { id },
      data: {
        name,
        ip,
        port: port !== undefined ? Number(port) : undefined,
        amiUsername,
        amiPassword,
        sshUsername,
        sshPassword,
      },
    });

    return NextResponse.json({ success: true, server: updated });
  } catch (error: any) {
    console.error("Failed to update server:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update server" },
      { status: 500 }
    );
  }
}

// DELETE /api/servers?id=xxx - Soft-delete a server
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Server ID is required" },
        { status: 400 }
      );
    }

    await prisma.server.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Server berhasil dihapus" });
  } catch (error: any) {
    console.error("Failed to delete server:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete server" },
      { status: 500 }
    );
  }
}
