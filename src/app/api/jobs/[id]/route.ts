import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outJob } from "@/lib/store";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const data: any = {};
  for (const k of ["title", "department", "location", "description"]) {
    if (b[k] !== undefined) data[k] = String(b[k]);
  }
  if (b.minExperience !== undefined) data.minExperience = Number(b.minExperience) || 0;
  if (b.open !== undefined) data.open = !!b.open;
  if (b.requiredSkills !== undefined) data.requiredSkills = JSON.stringify(Array.isArray(b.requiredSkills) ? b.requiredSkills : []);
  const updated = await prisma.job.update({ where: { id: params.id }, data });
  return NextResponse.json(outJob(updated));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.job.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
