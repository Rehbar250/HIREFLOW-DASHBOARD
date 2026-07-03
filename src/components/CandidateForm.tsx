"use client";
import { useState } from "react";
import { Modal, Field, Btn, inputCls } from "./ui";
import { api } from "@/lib/client";
import type { Candidate, Job } from "@/lib/types";

const splitSkills = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function CandidateForm({
  candidate, jobs, onClose, onSaved,
}: { candidate: Candidate | null; jobs: Job[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: candidate?.name || "", email: candidate?.email || "", phone: candidate?.phone || "",
    role: candidate?.role || jobs[0]?.title || "", location: candidate?.location || "",
    experience: candidate?.experience ?? 0, status: candidate?.status || "new", notes: candidate?.notes || "",
  });
  const [skillsText, setSkillsText] = useState((candidate?.skills || []).join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (!f.name.trim() || !f.email.trim()) { setErr("Name and email are required."); return; }
    setBusy(true); setErr("");
    const payload = { ...f, experience: Number(f.experience) || 0, skills: splitSkills(skillsText) };
    try {
      if (candidate) await api.patch(`/api/candidates/${candidate.id}`, payload);
      else await api.post("/api/candidates", payload);
      onSaved();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Modal title={candidate ? "Edit candidate" : "Add candidate"} onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name"><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Jordan Lee" /></Field>
        <Field label="Email"><input className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="jordan@example.com" /></Field>
        <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Applying for">
          <select className={inputCls} value={f.role} onChange={(e) => set("role", e.target.value)}>
            {jobs.map((j) => <option key={j.id} value={j.title}>{j.title}</option>)}
            {f.role && !jobs.find((j) => j.title === f.role) && <option value={f.role}>{f.role}</option>}
          </select>
        </Field>
        <Field label="Years of experience"><input type="number" min="0" className={inputCls} value={f.experience} onChange={(e) => set("experience", e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Skills (comma separated)"><input className={inputCls} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript, CSS" /></Field></div>
        <div className="sm:col-span-2"><Field label="Notes"><textarea rows={3} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field></div>
      </div>
      {err && <p className="text-sm text-rose-600 mt-3">{err}</p>}
      <div className="flex justify-end gap-2 mt-5">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={busy}>{candidate ? "Save changes" : "Add candidate"}</Btn>
      </div>
    </Modal>
  );
}
