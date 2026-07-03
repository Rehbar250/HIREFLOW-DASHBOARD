// Match score: 70% skills overlap + 30% experience fit. Pure function, shared.
export type MatchResult = {
  total: number;
  matched: string[];
  missing: string[];
  skillScore: number;
  expScore: number;
};

export function scoreCandidate(
  candidate: { skills: string[]; experience: number },
  job: { requiredSkills: string[]; minExperience: number }
): MatchResult {
  const have = candidate.skills.map((s) => s.toLowerCase());
  const matched = job.requiredSkills.filter((s) => have.includes(s.toLowerCase()));
  const missing = job.requiredSkills.filter((s) => !have.includes(s.toLowerCase()));
  const skillScore = job.requiredSkills.length ? (matched.length / job.requiredSkills.length) * 100 : 0;
  const expScore = job.minExperience <= 0 ? 100 : Math.min(100, (candidate.experience / job.minExperience) * 100);
  const total = Math.round(skillScore * 0.7 + expScore * 0.3);
  return { total, matched, missing, skillScore: Math.round(skillScore), expScore: Math.round(expScore) };
}
