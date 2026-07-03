import { prisma } from "./db";

export function arr(s: string): string[] {
  try {
    const a = JSON.parse(s);
    return Array.isArray(a) ? a.map(String) : [];
  } catch {
    return [];
  }
}

export function outCandidate(c: any) {
  return { ...c, skills: arr(c.skills), createdAt: c.createdAt?.toISOString?.() ?? c.createdAt };
}
export function outJob(j: any) {
  return { ...j, requiredSkills: arr(j.requiredSkills), createdAt: j.createdAt?.toISOString?.() ?? j.createdAt };
}
export function outEmail(e: any) {
  return { ...e, createdAt: e.createdAt?.toISOString?.() ?? e.createdAt };
}

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    company: map.company ?? process.env.COMPANY_NAME ?? "COMPANY",
    autoAck: (map.autoAck ?? "true") === "true",
  };
}
