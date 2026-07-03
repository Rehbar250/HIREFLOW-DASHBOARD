"use client";
import { X } from "lucide-react";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/constants";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Btn({
  children, onClick, variant = "primary", className = "", disabled, type = "button",
}: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "subtle";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
    danger: "bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_CLASS[status] || STATUS_CLASS.new}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hues = [
    "bg-indigo-100 text-indigo-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
    "bg-sky-100 text-sky-700", "bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700",
  ];
  const h = hues[(name || "").length % hues.length];
  return <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${h}`}>{initials}</div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, sub, action }: { icon: any; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center"><Icon className="h-5 w-5 text-slate-400" /></div>
      <p className="font-medium text-slate-700">{title}</p>
      {sub && <p className="text-sm text-slate-500 mt-1 mb-4">{sub}</p>}
      {action}
    </div>
  );
}

export function ScoreRing({ value }: { value: number }) {
  const tone = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#f43f5e";
  const r = 20, circ = 2 * Math.PI * r, off = circ - (value / 100) * circ;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={tone} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export const inputCls = "input";
