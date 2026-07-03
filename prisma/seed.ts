import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  { id: "received", name: "Application received", subject: "We received your application — {{role}} at {{company}}", body: "Hi {{name}},\n\nThanks for applying for the {{role}} role at {{company}}. We've received your application and our team is reviewing it now. We'll be in touch with next steps soon.\n\nWarm regards,\nThe {{company}} Talent Team" },
  { id: "interview", name: "Interview invitation", subject: "Let's talk — {{role}} interview at {{company}}", body: "Hi {{name}},\n\nWe enjoyed reviewing your application for the {{role}} role and would love to schedule a conversation. Could you share a few time slots that work for you this week?\n\nLooking forward to it,\nThe {{company}} Talent Team" },
  { id: "offer", name: "Offer", subject: "An offer for you — {{role}} at {{company}}", body: "Hi {{name}},\n\nWe're delighted to extend an offer for the {{role}} role at {{company}}. We were impressed throughout the process and believe you'll do great things here. Let's find time to talk through the details.\n\nCongratulations,\nThe {{company}} Talent Team" },
  { id: "rejected", name: "Respectful no", subject: "Update on your {{role}} application", body: "Hi {{name}},\n\nThank you for the time you put into applying for the {{role}} role at {{company}}. After careful consideration we've decided to move forward with other candidates. This was a tough call, and we'd genuinely welcome a future application from you.\n\nWith appreciation,\nThe {{company}} Talent Team" },
];

const JOBS = [
  { title: "Senior Frontend Engineer", department: "Engineering", location: "Bengaluru · Hybrid", minExperience: 4, requiredSkills: ["React", "TypeScript", "CSS", "Next.js", "Testing"], description: "Own the web experience end to end and mentor the frontend guild." },
  { title: "Product Designer", department: "Design", location: "Remote", minExperience: 3, requiredSkills: ["Figma", "UI Design", "Prototyping", "User Research"], description: "Shape product flows from research through polished, shippable UI." },
  { title: "Data Analyst", department: "Analytics", location: "Gurugram", minExperience: 2, requiredSkills: ["SQL", "Python", "Excel", "Tableau", "Statistics"], description: "Turn raw product and revenue data into decisions leadership can act on." },
];

const CANDIDATES = [
  { name: "Aanya Sharma", email: "aanya.sharma@example.com", phone: "+91 90000 11111", role: "Senior Frontend Engineer", location: "Bengaluru", experience: 5, skills: ["React", "TypeScript", "CSS", "Next.js"], status: "new", notes: "Strong portfolio, led a design-system migration." },
  { name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 90000 22222", role: "Senior Frontend Engineer", location: "Pune", experience: 3, skills: ["React", "JavaScript", "CSS"], status: "screening", notes: "Eager, needs TypeScript depth." },
  { name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 90000 33333", role: "Product Designer", location: "Remote", experience: 4, skills: ["Figma", "UI Design", "Prototyping", "User Research"], status: "interview", notes: "Excellent research case studies." },
  { name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91 90000 44444", role: "Data Analyst", location: "Gurugram", experience: 3, skills: ["SQL", "Python", "Tableau", "Statistics"], status: "new", notes: "Built dashboards at a fintech startup." },
  { name: "Sara Khan", email: "sara.khan@example.com", phone: "+91 90000 55555", role: "Product Designer", location: "Mumbai", experience: 2, skills: ["Figma", "UI Design", "Illustration"], status: "new", notes: "Great visual sense, lighter on research." },
  { name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 90000 66666", role: "Data Analyst", location: "Hyderabad", experience: 1, skills: ["SQL", "Excel", "Python"], status: "screening", notes: "Junior, sharp with SQL." },
];

async function main() {
  for (const t of DEFAULT_TEMPLATES) {
    await prisma.template.upsert({ where: { id: t.id }, update: t, create: t });
  }
  await prisma.setting.upsert({ where: { key: "company" }, update: {}, create: { key: "company", value: process.env.COMPANY_NAME || "COMPANY" } });
  await prisma.setting.upsert({ where: { key: "autoAck" }, update: {}, create: { key: "autoAck", value: "true" } });

  if ((await prisma.job.count()) === 0) {
    for (const j of JOBS) {
      await prisma.job.create({ data: { ...j, requiredSkills: JSON.stringify(j.requiredSkills) } });
    }
  }
  if ((await prisma.candidate.count()) === 0) {
    for (const c of CANDIDATES) {
      await prisma.candidate.create({ data: { ...c, skills: JSON.stringify(c.skills), source: "seed" } });
    }
  }
  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
