import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outCandidate, getSettings } from "@/lib/store";
import { fillTemplate, sendEmail } from "@/lib/email";

export async function GET() {
  const rows = await prisma.candidate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(outCandidate));
}

export async function POST(req: Request) {
  const b = await req.json();
  if (!b?.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const created = await prisma.candidate.create({
    data: {
      name: String(b.name), email: String(b.email || ""), phone: String(b.phone || ""),
      role: String(b.role || ""), location: String(b.location || ""),
      experience: Number(b.experience) || 0,
      skills: JSON.stringify(Array.isArray(b.skills) ? b.skills : []),
      status: String(b.status || "new"), notes: String(b.notes || ""),
      source: String(b.source || "manual"),
    },
  });

  // Automation: acknowledge new applicants.
  const settings = await getSettings();
  if (settings.autoAck && created.email) {
    const t = await prisma.template.findUnique({ where: { id: "received" } });
    if (t) {
      const vars = { name: created.name, role: created.role, company: settings.company };
      const subject = fillTemplate(t.subject, vars);
      const body = fillTemplate(t.body, vars);
      let delivered = false;
      try { delivered = (await sendEmail({ to: created.email, subject, body })).delivered; } catch {}
      await prisma.emailLog.create({
        data: { to: created.email, candidateName: created.name, subject, body, template: "received", auto: true, delivered },
      });
    }
  }
  return NextResponse.json(outCandidate(created), { status: 201 });
}
