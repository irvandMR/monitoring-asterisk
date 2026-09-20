import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Client } from "ssh2";
import fs from "fs";
import os from "os";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serverId, action, Command, ...params } = body;

    if (!serverId || !action) {
      return NextResponse.json({ success: false, error: "Missing serverId or action" }, { status: 400 });
    }

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server || !server.sshUsername) {
      return NextResponse.json({ success: false, error: "Invalid server or missing SSH credentials" }, { status: 400 });
    }

    if (action !== "Command" || !Command) {
      // If it's not a Command, return success for now (fallback for other AMI actions if any exist)
      return NextResponse.json({ success: true, data: { Response: "Success", Output: [] } });
    }

    // Determine the SSH command to execute
    let execCmd = Command.trim();
    // If it's a common Asterisk command but doesn't start with asterisk or sudo, wrap it
    if (execCmd.match(/^(pjsip|core|dialplan|sip|ari|manager|module|logger|rtp)/)) {
      execCmd = `sudo asterisk -rx "${execCmd}"`;
    }

    const conn = new Client();
    
    // Read local key as fallback
    let privateKey;
    try {
      if (server.sshKey) {
        privateKey = server.sshKey;
      } else {
        privateKey = fs.readFileSync(os.homedir() + "/.ssh/id_ed25519");
      }
    } catch (e) {
      // ignore
    }

    const output = await new Promise<string>((resolve, reject) => {
      conn.on('ready', () => {
        conn.exec(execCmd, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          let stdout = "";
          let stderr = "";
          stream.on('close', (code: any, signal: any) => {
            conn.end();
            if (code !== 0 && stderr) {
              // Even if error, just return the text so it prints to the CLI
              resolve(stderr + "\n" + stdout);
            } else {
              resolve(stdout);
            }
          }).on('data', (data: any) => {
            stdout += data.toString();
          }).stderr.on('data', (data: any) => {
            stderr += data.toString();
          });
        });
      }).on('error', (err) => {
        reject(err);
      }).connect({
        host: server.ip,
        port: 22, // Always use default SSH port unless specified otherwise
        username: server.sshUsername,
        password: server.sshPassword || undefined,
        privateKey: privateKey,
        readyTimeout: 10000
      });
    });

    // Format to match old AMI response structure so frontend doesn't break
    const lines = output.split("\n");
    return NextResponse.json({ 
      success: true, 
      data: { 
        Response: "Success", 
        Message: "SSH Execution Success",
        Output: lines
      } 
    });

  } catch (error: any) {
    console.error("[SSH Action Error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to execute SSH command" }, { status: 500 });
  }
}
