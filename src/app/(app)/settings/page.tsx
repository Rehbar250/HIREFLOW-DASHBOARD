"use client";
import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { PageHead, Btn, Field, inputCls } from "@/components/ui";
import { api } from "@/lib/client";

export default function SettingsPage() {
  const [company, setCompany] = useState("");
  const [autoAck, setAutoAck] = useState(true);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get("/api/settings").then((s) => { setCompany(s.company); setAutoAck(s.autoAck); setGeminiConfigured(s.geminiConfigured); }).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, autoAck }) });
      setToast("Settings saved."); setTimeout(() => setToast(""), 2000);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  return (
    <div className="max-w-2xl">
      <PageHead title="Settings" sub="Branding, automation, and integration status." />
      {toast && <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 ring-1 ring-emerald-200">{toast}</div>}

      <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-5">
        <h3 className="font-display font-semibold mb-4">Company</h3>
        <Field label="Company name">
          <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <p className="text-xs text-slate-400 mt-2">Appears in the sidebar and fills the <code className="bg-slate-100 px-1 rounded">{"{{company}}"}</code> placeholder in emails.</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-5">
        <h3 className="font-display font-semibold mb-4">Automation</h3>
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <div className="text-sm font-medium">Auto-acknowledge new applicants</div>
            <div className="text-xs text-slate-500">When a candidate with an email is added or imported, send the "Application received" template automatically.</div>
          </div>
          <button onClick={() => setAutoAck((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${autoAck ? "bg-indigo-600" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${autoAck ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </label>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-5">
        <h3 className="font-display font-semibold mb-1">Résumé parsing · Google Gemini</h3>
        <p className="text-xs text-slate-500 mb-4">The Gemini API key is stored on the server, never in the browser.</p>
        {geminiConfigured ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> A Gemini key is configured. PDF and DOCX import will use it.
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>No key set. CSV and XML still import; for PDF/DOCX, add <code className="bg-white/60 px-1 rounded">GEMINI_API_KEY</code> to your server environment and restart.</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-xs text-slate-400 mt-3">
          <KeyRound className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Set <code className="bg-slate-100 px-1 rounded">GEMINI_API_KEY</code> and <code className="bg-slate-100 px-1 rounded">GEMINI_MODEL</code> in <code className="bg-slate-100 px-1 rounded">.env</code> (local) or your host's secret manager (production).</span>
        </div>
      </div>

      <div className="flex justify-end"><Btn onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</Btn></div>
    </div>
  );
}
