"use client";
import { useState } from "react";
import { Modal, Field, Btn, inputCls } from "./ui";
import { Send } from "lucide-react";
import { api } from "@/lib/client";
import type { Template } from "@/lib/types";

type Recipient = { id: string; name: string; email: string; role?: string };

export default function Composer({
  recipients, role, templates, company, onClose, onSent,
}: {
  recipients: Recipient[]; role: string; templates: Template[]; company: string;
  onClose: () => void; onSent: (msg: string) => void;
}) {
  const [templateId, setTemplateId] = useState(templates.find((t) => t.id === "interview")?.id || templates[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const tpl = templates.find((t) => t.id === templateId);

  const fill = (text: string, name: string) =>
    (text || "").replaceAll("{{name}}", name).replaceAll("{{role}}", role || recipients[0]?.role || "").replaceAll("{{company}}", company);

  const preview = tpl && recipients[0]
    ? { subject: fill(tpl.subject, recipients[0].name), body: fill(tpl.body, recipients[0].name) }
    : { subject: "", body: "" };

  async function send() {
    setBusy(true); setErr("");
    try {
      const res = await api.post("/api/emails", {
        recipients: recipients.map((r) => ({ name: r.name, email: r.email, role: r.role })),
        templateId, role,
      });
      onSent(res.sent > 0 ? `Sent ${res.sent} of ${res.logged} email(s).` : `Logged ${res.logged} email(s) — configure SMTP to deliver them.`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Modal title={`Email ${recipients.length} candidate${recipients.length === 1 ? "" : "s"}`} onClose={onClose} wide>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {recipients.map((r) => <span key={r.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{r.name || r.email}</span>)}
      </div>
      <Field label="Template">
        <select className={inputCls} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs text-slate-500 mb-1">Preview {recipients.length > 1 ? `(shown for ${recipients[0].name}; each candidate gets their own)` : ""}</div>
        <div className="text-sm font-medium">{preview.subject}</div>
        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{preview.body}</p>
      </div>
      {err && <p className="text-sm text-rose-600 mt-3">{err}</p>}
      <div className="flex items-center justify-between gap-2 mt-5">
        <p className="text-xs text-slate-400 max-w-xs">Sends through your configured SMTP server and records every message in the log.</p>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={send} disabled={busy}><Send className="h-4 w-4" /> Send</Btn>
        </div>
      </div>
    </Modal>
  );
}
