import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outEmail, getSettings } from "@/lib/store";
import { fillTemplate, sendEmail } from "@/lib/email";

export async function GET() {
  const rows = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(rows.map(outEmail));
}

export async function POST(req: Request) {
  const { recipients, templateId, role } = await req.json();
  if (!Array.isArray(recipients) || !recipients.length) {
    return NextResponse.json({ error: "No recipients." }, { status: 400 });
  }
  const t = await prisma.template.findUnique({ where: { id: templateId } });
  if (!t) return NextResponse.json({ error: "Template not found." }, { status: 400 });
  const settings = await getSettings();

  let sent = 0, logged = 0;
  for (const r of recipients) {
    if (!r?.email) continue;
    const vars = { name: r.name || "", role: role || r.role || "", company: settings.company };
    const subject = fillTemplate(t.subject, vars);
    const body = fillTemplate(t.body, vars);
    let delivered = false;
    try { delivered = (await sendEmail({ to: r.email, subject, body })).delivered; } catch {}
    if (delivered) sent++;
    await prisma.emailLog.create({
      data: { to: r.email, candidateName: r.name || "", subject, body, template: templateId, auto: false, delivered },
    });
    logged++;
  }
  return NextResponse.json({ logged, sent });
}
