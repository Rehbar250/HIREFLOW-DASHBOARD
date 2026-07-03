import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outJob } from "@/lib/store";

export async function GET() {
  const rows = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(outJob));
}

export async function POST(req: Request) {
  const b = await req.json();
  if (!b?.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const created = await prisma.job.create({
    data: {
      title: String(b.title), department: String(b.department || ""),
      location: String(b.location || ""), minExperience: Number(b.minExperience) || 0,
      requiredSkills: JSON.stringify(Array.isArray(b.requiredSkills) ? b.requiredSkills : []),
      description: String(b.description || ""), open: b.open !== false,
    },
  });
  return NextResponse.json(outJob(created), { status: 201 });
}
