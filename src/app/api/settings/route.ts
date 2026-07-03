import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/store";

export async function GET() {
  const settings = await getSettings();
  // Report whether the server has a Gemini key, without exposing it.
  return NextResponse.json({ ...settings, geminiConfigured: !!(process.env.GEMINI_API_KEY || "").trim() });
}

export async function PUT(req: Request) {
  const b = await req.json();
  const ops: Promise<any>[] = [];
  if (b.company !== undefined) {
    ops.push(prisma.setting.upsert({ where: { key: "company" }, update: { value: String(b.company) }, create: { key: "company", value: String(b.company) } }));
  }
  if (b.autoAck !== undefined) {
    ops.push(prisma.setting.upsert({ where: { key: "autoAck" }, update: { value: b.autoAck ? "true" : "false" }, create: { key: "autoAck", value: b.autoAck ? "true" : "false" } }));
  }
  await Promise.all(ops);
  const settings = await getSettings();
  return NextResponse.json({ ...settings, geminiConfigured: !!(process.env.GEMINI_API_KEY || "").trim() });
}
