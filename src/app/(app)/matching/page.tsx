"use client";
import { useEffect, useMemo, useState } from "react";
import { Target, Sparkles, Send, Mail, Check, Loader2 } from "lucide-react";
import { PageHead, Btn, Empty, StatusBadge, ScoreRing, inputCls } from "@/components/ui";
import Composer from "@/components/Composer";
import { api } from "@/lib/client";
import { scoreCandidate } from "@/lib/match";
import type { Candidate, Job, Template } from "@/lib/types";

export default function MatchingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [company, setCompany] = useState("COMPANY");
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [composing, setComposing] = useState<Candidate[] | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([api.get("/api/candidates"), api.get("/api/jobs"), api.get("/api/templates"), api.get("/api/settings")])
      .then(([c, j, t, s]) => { setCandidates(c); setJobs(j); setTemplates(t); setCompany(s.company); setJobId(j.find((x: Job) => x.open)?.id || j[0]?.id || ""); })
      .finally(() => setLoading(false));
  }, []);

  const job = jobs.find((j) => j.id === jobId);
  const ranked = useMemo(() => {
    if (!job) return [];
    return candidates.map((c) => ({ c, score: scoreCandidate(c, job) })).sort((a, b) => b.score.total - a.score.total);
  }, [job, candidates]);

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  if (jobs.length === 0) return <Empty icon={Target} title="No roles to match against" sub="Create a job role first, then come back to shortlist." />;

  const chosen = ranked.filter((r) => selected[r.c.id]).map((r) => r.c);
  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  function selectTop(n: number) { const top: Record<string, boolean> = {}; ranked.slice(0, n).forEach((r) => (top[r.c.id] = true)); setSelected(top); }

  return (
    <div>
      <PageHead title="Match & shortlist" sub="Candidates ranked by fit against the role you pick. Skills weighted 70%, experience 30%." />
      {toast && <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 ring-1 ring-emerald-200">{toast}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <select value={jobId} onChange={(e) => { setJobId(e.target.value); setSelected({}); }} className={`${inputCls} sm:w-80`}>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}{j.open ? "" : " (closed)"}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Btn variant="subtle" onClick={() => selectTop(3)}><Sparkles className="h-4 w-4" /> Select top 3</Btn>
          {chosen.length > 0 && <Btn onClick={() => setComposing(chosen)}><Send className="h-4 w-4" /> Email {chosen.length} selected</Btn>}
        </div>
      </div>

      {job && (
        <div className="rounded-xl bg-white border border-slate-200 p-4 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-500">Requires:</span>
          {job.requiredSkills.map((s) => <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">{s}</span>)}
          <span className="text-slate-400">· {job.minExperience}+ yrs</span>
        </div>
      )}

      <div className="space-y-3">
        {ranked.map(({ c, score }) => {
          const isSel = !!selected[c.id];
          return (
            <div key={c.id} className={`rounded-2xl bg-white border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${isSel ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200"}`}>
              <button onClick={() => toggle(c.id)} className={`h-5 w-5 shrink-0 rounded-md border flex items-center justify-center ${isSel ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                {isSel && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
              <ScoreRing value={score.total} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.name}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-slate-400">{c.experience} yr · applied for {c.role}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {score.matched.map((s) => <span key={s} className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 flex items-center gap-1"><Check className="h-3 w-3" />{s}</span>)}
                  {score.missing.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400 line-through">{s}</span>)}
                </div>
              </div>
              <button onClick={() => setComposing([c])} className="rounded-lg px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 self-start"><Mail className="h-4 w-4" /> Invite</button>
            </div>
          );
        })}
      </div>

      {composing && (
        <Composer
          recipients={composing.map((c) => ({ id: c.id, name: c.name, email: c.email, role: c.role }))}
          role={job?.title || ""}
          templates={templates}
          company={company}
          onClose={() => setComposing(null)}
          onSent={(m) => { setComposing(null); setToast(m); setTimeout(() => setToast(""), 2500); }}
        />
      )}
    </div>
  );
}
