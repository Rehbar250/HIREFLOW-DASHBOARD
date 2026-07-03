"use client";
import { useEffect, useState } from "react";
import { Mail, Save, Loader2, Inbox, Bot, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHead, Btn, Empty, inputCls } from "@/components/ui";
import { api } from "@/lib/client";
import type { Template, EmailLog } from "@/lib/types";

export default function EmailPage() {
  const [tab, setTab] = useState<"log" | "templates">("log");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState<{ subject: string; body: string }>({ subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function load() {
    const [t, e] = await Promise.all([api.get("/api/templates"), api.get("/api/emails")]);
    setTemplates(t); setEmails(e);
    if (t[0]) { setActiveId(t[0].id); setDraft({ subject: t[0].subject, body: t[0].body }); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function pick(t: Template) { setActiveId(t.id); setDraft({ subject: t.subject, body: t.body }); }
  async function save() {
    const t = templates.find((x) => x.id === activeId);
    if (!t) return;
    setSaving(true);
    try {
      const updated = await fetch("/api/templates", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, name: t.name, subject: draft.subject, body: draft.body }),
      }).then((r) => r.json());
      setTemplates((ts) => ts.map((x) => (x.id === updated.id ? updated : x)));
      setToast("Template saved."); setTimeout(() => setToast(""), 2000);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  return (
    <div>
      <PageHead title="Email" sub="Edit the templates behind every message, and review what's been sent." />
      {toast && <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 ring-1 ring-emerald-200">{toast}</div>}

      <div className="flex gap-1 mb-5 rounded-lg bg-slate-100 p-1 w-fit">
        {(["log", "templates"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3.5 py-1.5 text-sm font-medium ${tab === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>
            {t === "log" ? "Sent log" : "Templates"}
          </button>
        ))}
      </div>

      {tab === "templates" ? (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            {templates.map((t) => (
              <button key={t.id} onClick={() => pick(t)} className={`w-full text-left rounded-lg px-3 py-2.5 text-sm ${activeId === t.id ? "bg-indigo-50 text-indigo-700 font-medium" : "bg-white border border-slate-200 hover:bg-slate-50"}`}>{t.name}</button>
            ))}
          </div>
          <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-xs text-slate-400 mb-4">Use <code className="bg-slate-100 px-1 rounded">{"{{name}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{role}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{company}}"}</code> as placeholders.</p>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
            <input className={inputCls} value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
            <label className="block text-xs font-medium text-slate-600 mb-1 mt-4">Body</label>
            <textarea rows={9} className={inputCls} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
            <div className="flex justify-end mt-4"><Btn onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save template</Btn></div>
          </div>
        </div>
      ) : emails.length === 0 ? (
        <Empty icon={Inbox} title="No emails yet" sub="Messages you send from Candidates or Matching show up here." />
      ) : (
        <div className="space-y-3">
          {emails.map((e) => (
            <div key={e.id} className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.subject}</div>
                    <div className="text-xs text-slate-500 truncate">To {e.candidateName || e.to} · {e.to}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {e.auto && <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700"><Bot className="h-3 w-3" /> Auto</span>}
                  {e.delivered
                    ? <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Sent</span>
                    : <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700"><AlertCircle className="h-3 w-3" /> Logged</span>}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-line line-clamp-3">{e.body}</p>
              <div className="text-[11px] text-slate-400 mt-2">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
