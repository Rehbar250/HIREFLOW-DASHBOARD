import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rows = await prisma.template.findMany();
  const order = ["received", "interview", "offer", "rejected"];
  rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return NextResponse.json(rows);
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b?.id) return NextResponse.json({ error: "Template id required." }, { status: 400 });
  const updated = await prisma.template.update({
    where: { id: b.id },
    data: { subject: String(b.subject || ""), body: String(b.body || ""), name: String(b.name || b.id) },
  });
  return NextResponse.json(updated);
}
