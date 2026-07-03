"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Briefcase, Target, Mail, ChevronRight, Loader2 } from "lucide-react";
import { PageHead, Avatar, StatusBadge } from "@/components/ui";
import { api } from "@/lib/client";
import { STATUS_ORDER, STATUS_LABEL } from "@/lib/constants";
import type { Candidate, Job, EmailLog } from "@/lib/types";

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/candidates"), api.get("/api/jobs"), api.get("/api/emails")])
      .then(([c, j, e]) => { setCandidates(c); setJobs(j); setEmails(e); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  const openJobs = jobs.filter((j) => j.open).length;
  const stats = [
    { label: "Candidates", value: candidates.length, icon: Users, c: "text-indigo-600 bg-indigo-50" },
    { label: "Open roles", value: openJobs, icon: Briefcase, c: "text-sky-600 bg-sky-50" },
    { label: "In interview", value: candidates.filter((c) => c.status === "interview").length, icon: Target, c: "text-violet-600 bg-violet-50" },
    { label: "Emails sent", value: emails.length, icon: Mail, c: "text-emerald-600 bg-emerald-50" },
  ];
  const bar: Record<string, string> = { new: "bg-slate-400", screening: "bg-amber-400", interview: "bg-sky-400", offer: "bg-violet-400", hired: "bg-emerald-500", rejected: "bg-rose-400" };

  return (
    <div>
      <PageHead title="Dashboard" sub="Your hiring pipeline at a glance." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.c}`}><Icon className="h-5 w-5" /></div>
              <div className="font-display text-2xl font-semibold">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="font-display font-semibold mb-4">Pipeline by stage</h3>
          <div className="space-y-3">
            {STATUS_ORDER.map((s) => {
              const n = candidates.filter((c) => c.status === s).length;
              const pct = candidates.length ? (n / candidates.length) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-slate-600">{STATUS_LABEL[s]}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${bar[s]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-sm font-medium tabular-nums">{n}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent applicants</h3>
            <Link href="/candidates" className="text-xs text-indigo-600 hover:underline flex items-center">View all <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {candidates.length === 0 && <p className="text-sm text-slate-400">No candidates yet.</p>}
            {candidates.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-slate-500 truncate">{c.role}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
