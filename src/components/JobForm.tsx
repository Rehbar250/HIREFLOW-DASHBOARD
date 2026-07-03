"use client";
import { useState } from "react";
import { Modal, Field, Btn, inputCls } from "./ui";
import { api } from "@/lib/client";
import type { Job } from "@/lib/types";

const splitSkills = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function JobForm({ job, onClose, onSaved }: { job: Job | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    title: job?.title || "", department: job?.department || "", location: job?.location || "",
    minExperience: job?.minExperience ?? 0, description: job?.description || "", open: job?.open ?? true,
  });
  const [skillsText, setSkillsText] = useState((job?.requiredSkills || []).join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (!f.title.trim()) { setErr("Title is required."); return; }
    setBusy(true); setErr("");
    const payload = { ...f, minExperience: Number(f.minExperience) || 0, requiredSkills: splitSkills(skillsText) };
    try {
      if (job) await api.patch(`/api/jobs/${job.id}`, payload);
      else await api.post("/api/jobs", payload);
      onSaved();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Modal title={job ? "Edit role" : "New role"} onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Job title"><input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Senior Frontend Engineer" /></Field>
        <Field label="Department"><input className={inputCls} value={f.department} onChange={(e) => set("department", e.target.value)} /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Minimum experience (years)"><input type="number" min="0" className={inputCls} value={f.minExperience} onChange={(e) => set("minExperience", e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Required skills (comma separated)"><input className={inputCls} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript, CSS" /></Field></div>
        <div className="sm:col-span-2"><Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
      </div>
      {err && <p className="text-sm text-rose-600 mt-3">{err}</p>}
      <div className="flex justify-end gap-2 mt-5">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={busy}>{job ? "Save changes" : "Create role"}</Btn>
      </div>
    </Modal>
  );
}
