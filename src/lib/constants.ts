export const STATUS_ORDER = ["new", "screening", "interview", "offer", "hired", "rejected"] as const;
export type Status = (typeof STATUS_ORDER)[number];

export const STATUS_LABEL: Record<string, string> = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Not moving forward",
};

export const STATUS_CLASS: Record<string, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-200",
  screening: "bg-amber-100 text-amber-800 ring-amber-200",
  interview: "bg-sky-100 text-sky-800 ring-sky-200",
  offer: "bg-violet-100 text-violet-800 ring-violet-200",
  hired: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-700 ring-rose-200",
};

export const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Vue", "Angular",
  "Python", "Java", "C++", "C#", "Go", "Ruby", "PHP", "Swift", "Kotlin",
  "HTML", "CSS", "Tailwind", "SQL", "PostgreSQL", "MongoDB", "GraphQL",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "CI/CD", "Testing",
  "Django", "Flask", "Spring", "Express", "REST",
  "Figma", "Sketch", "UI Design", "UX", "Prototyping", "User Research",
  "Illustration", "Photoshop", "Wireframing", "Design Systems",
  "Excel", "Tableau", "Power BI", "Statistics", "Data Analysis",
  "Machine Learning", "Pandas", "NumPy", "Spark",
  "Communication", "Leadership", "Project Management", "Product Management",
  "Agile", "Scrum", "Stakeholder Management",
];
