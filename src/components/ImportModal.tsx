"use client";
import { useState } from "react";
import { Modal, Field, Btn, inputCls } from "./ui";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { api } from "@/lib/client";
import type { Job } from "@/lib/types";

const splitSkills = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const uid = () => Math.random().toString(36).slice(2, 10);

type Draft = {
  key: string; source: string; status: "parsing" | "done" | "error"; error?: string; note?: string | null;
  name?: string; email?: string; phone?: string; role?: string; location?: string; experience?: number; skills?: string[];
};

export default function ImportModal({
  jobs, geminiConfigured, onClose, onImported,
}: { jobs: Job[]; geminiConfigured: boolean; onClose: () => void; onImported: (n: number) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    const pending = files.map((f) => ({ key: uid(), source: f.name, status: "parsing" as const }));
    setDrafts((d) => [...d, ...pending]);
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    try {
      const { results } = await api.upload("/api/parse", form);
      setDrafts((d) => {
        const rest = d.filter((x) => !pending.find((p) => p.key === x.key));
        const made: Draft[] = results.map((r: any) =>
          r.status === "error"
            ? { key: uid(), source: r.source, status: "error", error: r.error }
            : { key: uid(), source: r.source, status: "done", note: r.note, name: r.name || "", email: r.email || "", phone: r.phone || "", role: r.role || jobs[0]?.title || "", location: r.location || "", experience: r.experience || 0, skills: r.skills || [] }
        );
        return [...rest, ...made];
      });
    } catch (e: any) {
      setDrafts((d) => d.map((x) => (pending.find((p) => p.key === x.key) ? { ...x, status: "error", error: e.message } : x)));
    }
  }

  const update = (key: string, patch: Partial<Draft>) => setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const removeDraft = (key: string) => setDrafts((d) => d.filter((x) => x.key !== key));
  const valid = drafts.filter((d) => d.status === "done" && (d.name || "").trim());

  async function importAll() {
    setBusy(true);
    try {
      for (const d of valid) {
        await api.post("/api/candidates", {
          name: d.name, email: d.email, phone: d.phone, role: d.role, location: d.location,
          experience: d.experience, skills: d.skills, source: d.source,
        });
      }
      onImported(valid.length);
    } catch {
      setBusy(false);
    }
  }

  return (
    <Modal title="Import candidates from files" onClose={onClose} wide>
      {!geminiConfigured && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>No Gemini key on the server. XML and CSV import fully; to auto-read PDF and DOCX, set <code className="bg-white/60 px-1 rounded">GEMINI_API_KEY</code> in the server environment.</span>
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${drag ? "border-indigo-400 bg-indigo-50" : "border-slate-300 bg-slate-50"}`}
      >
        <div className="mx-auto mb-3 h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><Upload className="h-5 w-5 text-indigo-600" /></div>
        <p className="text-sm font-medium text-slate-700">Drop résumés here, or</p>
        <label className="inline-block mt-2 cursor-pointer rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Choose files
          <input type="file" multiple accept=".pdf,.docx,.xml,.csv,.tsv,.txt" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </label>
        <p className="text-xs text-slate-400 mt-3">PDF · DOCX · XML · CSV — one résumé per file, or a CSV/XML with many records.</p>
      </div>

      {drafts.length > 0 && (
        <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
          {drafts.map((d) => (
            <div key={d.key} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{d.source}</span>
                </div>
                {d.status === "parsing" && <span className="flex items-center gap-1 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading…</span>}
                {d.status === "done" && <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><button onClick={() => removeDraft(d.key)} className="text-slate-400 hover:text-rose-600"><X className="h-4 w-4" /></button></span>}
                {d.status === "error" && <span className="flex items-center gap-1 text-xs text-rose-600"><AlertCircle className="h-3.5 w-3.5" /> Failed</span>}
              </div>
              {d.status === "error" && <p className="text-xs text-rose-500">{d.error}</p>}
              {d.status === "done" && (
                <div>
                  {d.note && <p className="text-[11px] text-amber-600 mb-2">{d.note}</p>}
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input className={inputCls} placeholder="Name" value={d.name} onChange={(e) => update(d.key, { name: e.target.value })} />
                    <input className={inputCls} placeholder="Email" value={d.email} onChange={(e) => update(d.key, { email: e.target.value })} />
                    <input className={inputCls} placeholder="Phone" value={d.phone} onChange={(e) => update(d.key, { phone: e.target.value })} />
                    <select className={inputCls} value={d.role} onChange={(e) => update(d.key, { role: e.target.value })}>
                      {!d.role && <option value="">Select role…</option>}
                      {jobs.map((j) => <option key={j.id} value={j.title}>{j.title}</option>)}
                      {d.role && !jobs.find((j) => j.title === d.role) && <option value={d.role}>{d.role}</option>}
                    </select>
                    <input type="number" min="0" className={inputCls} placeholder="Experience (yrs)" value={d.experience} onChange={(e) => update(d.key, { experience: Number(e.target.value) || 0 })} />
                    <input className={inputCls} placeholder="Skills (comma separated)" value={(d.skills || []).join(", ")} onChange={(e) => update(d.key, { skills: splitSkills(e.target.value) })} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-5">
        <p className="text-xs text-slate-400 max-w-xs">Details are auto-extracted on the server, then yours to review before they join the pool.</p>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={importAll} disabled={!valid.length || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Import {valid.length || ""}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
