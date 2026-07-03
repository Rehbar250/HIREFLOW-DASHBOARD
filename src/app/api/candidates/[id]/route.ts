import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outCandidate } from "@/lib/store";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const data: any = {};
  for (const k of ["name", "email", "phone", "role", "location", "status", "notes"]) {
    if (b[k] !== undefined) data[k] = String(b[k]);
  }
  if (b.experience !== undefined) data.experience = Number(b.experience) || 0;
  if (b.skills !== undefined) data.skills = JSON.stringify(Array.isArray(b.skills) ? b.skills : []);
  const updated = await prisma.candidate.update({ where: { id: params.id }, data });
  return NextResponse.json(outCandidate(updated));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.candidate.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
