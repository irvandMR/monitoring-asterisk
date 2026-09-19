import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
      role: string;
    };

    return NextResponse.json({
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
