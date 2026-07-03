import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { arr } from "@/lib/store";
import { parseUpload } from "@/lib/parse";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files uploaded." }, { status: 400 });

  const jobs = await prisma.job.findMany({ select: { title: true } });
  const jobTitles = jobs.map((j) => j.title);

  const results: any[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const drafts = await parseUpload({ name: file.name, buffer }, jobTitles);
      for (const d of drafts) {
        results.push({
          ...d,
          source: file.name,
          status: "done",
          note: !d.name && !d.email ? "Couldn't auto-detect much — please fill in." : null,
        });
      }
    } catch (e: any) {
      results.push({ source: file.name, status: "error", error: e.message || "Couldn't read this file." });
    }
  }
  return NextResponse.json({ results });
}
