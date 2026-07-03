"use client";
import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Upload, Search, Mail, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageHead, Avatar, StatusBadge, Btn, Empty, inputCls } from "@/components/ui";
import CandidateForm from "@/components/CandidateForm";
import ImportModal from "@/components/ImportModal";
import Composer from "@/components/Composer";
import { api } from "@/lib/client";
import { STATUS_ORDER, STATUS_LABEL } from "@/lib/constants";
import type { Candidate, Job, Template } from "@/lib/types";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [company, setCompany] = useState("COMPANY");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Candidate | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const [emailing, setEmailing] = useState<Candidate | null>(null);
  const [toast, setToast] = useState("");

  async function load() {
    const [c, j, t, s] = await Promise.all([api.get("/api/candidates"), api.get("/api/jobs"), api.get("/api/templates"), api.get("/api/settings")]);
    setCandidates(c); setJobs(j); setTemplates(t); setCompany(s.company); setGeminiConfigured(s.geminiConfigured);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const filtered = useMemo(() => candidates.filter((c) => {
    const hitQ = (c.name + c.role + c.email + c.skills.join(" ")).toLowerCase().includes(q.toLowerCase());
    const hitF = filter === "all" || c.status === filter;
    return hitQ && hitF;
  }), [candidates, q, filter]);

  async function setStatus(c: Candidate, status: string) {
    setCandidates((cs) => cs.map((x) => (x.id === c.id ? { ...x, status } : x)));
    await api.patch(`/api/candidates/${c.id}`, { status });
  }
  async function remove(c: Candidate) {
    if (!confirm(`Remove ${c.name}?`)) return;
    await api.del(`/api/candidates/${c.id}`);
    setCandidates((cs) => cs.filter((x) => x.id !== c.id));
  }

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  return (
    <div>
      <PageHead title="Candidates" sub={`${candidates.length} people in your talent pool.`}
        action={
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => setImporting(true)}><Upload className="h-4 w-4" /> Import file</Btn>
            <Btn onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Add candidate</Btn>
          </div>
        }
      />
      {toast && <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 ring-1 ring-emerald-200">{toast}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, role, or skill" className={`${inputCls} pl-9`} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputCls} sm:w-52`}>
          <option value="all">All stages</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty icon={Users} title="No candidates match" sub="Try a different search, or add someone new." action={<Btn onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Add candidate</Btn>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-slate-400">· {c.experience} yr exp</span>
                </div>
                <div className="text-sm text-slate-500">{c.role} · {c.email}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.skills.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{s}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={c.status} onChange={(e) => setStatus(c, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <button title="Email" onClick={() => setEmailing(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Mail className="h-4 w-4" /></button>
                <button title="Edit" onClick={() => setEditing(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                <button title="Remove" onClick={() => remove(c)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CandidateForm candidate={editing === "new" ? null : editing} jobs={jobs} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {importing && <ImportModal jobs={jobs} geminiConfigured={geminiConfigured} onClose={() => setImporting(false)} onImported={(n) => { setImporting(false); flash(`Imported ${n} candidate(s).`); load(); }} />}
      {emailing && <Composer recipients={[{ id: emailing.id, name: emailing.name, email: emailing.email, role: emailing.role }]} role={emailing.role} templates={templates} company={company} onClose={() => setEmailing(null)} onSent={(m) => { setEmailing(null); flash(m); load(); }} />}
    </div>
  );
}
