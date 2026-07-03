"use client";
import { useEffect, useState } from "react";
import { Briefcase, Plus, Pencil, Trash2, Building2, MapPin, Clock, Loader2 } from "lucide-react";
import { PageHead, Btn, Empty } from "@/components/ui";
import JobForm from "@/components/JobForm";
import { api } from "@/lib/client";
import type { Job, Candidate } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Job | "new" | null>(null);

  async function load() {
    const [j, c] = await Promise.all([api.get("/api/jobs"), api.get("/api/candidates")]);
    setJobs(j); setCandidates(c); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(j: Job) {
    setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, open: !x.open } : x)));
    await api.patch(`/api/jobs/${j.id}`, { open: !j.open });
  }
  async function remove(j: Job) {
    if (!confirm(`Delete "${j.title}"?`)) return;
    await api.del(`/api/jobs/${j.id}`);
    setJobs((js) => js.filter((x) => x.id !== j.id));
  }

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  return (
    <div>
      <PageHead title="Job roles" sub={`${jobs.filter((j) => j.open).length} open · ${jobs.length} total`}
        action={<Btn onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New role</Btn>} />

      {jobs.length === 0 ? (
        <Empty icon={Briefcase} title="No roles yet" sub="Post a role to start matching candidates against it." action={<Btn onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New role</Btn>} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((j) => {
            const applicants = candidates.filter((c) => c.role === j.title).length;
            return (
              <div key={j.id} className="rounded-2xl bg-white border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-semibold">{j.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{j.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{j.minExperience}+ yr</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${j.open ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>{j.open ? "Open" : "Closed"}</span>
                </div>
                <p className="text-sm text-slate-600 mt-3">{j.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {j.requiredSkills.map((s) => <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">{s}</span>)}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{applicants} applicant{applicants === 1 ? "" : "s"}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(j)} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100">{j.open ? "Close" : "Reopen"}</button>
                    <button onClick={() => setEditing(j)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(j)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <JobForm job={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
