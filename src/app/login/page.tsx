"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Incorrect password.");
      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Sign in failed.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-tight">HireFlow</div>
            <div className="text-xs text-slate-400">Recruitment workflow</div>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter your password"
          autoFocus
        />
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !password}
          className="mt-4 w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
        <p className="text-xs text-slate-400 mt-4">Set the password with <code className="bg-slate-100 px-1 rounded">ADMIN_PASSWORD</code> in your <code className="bg-slate-100 px-1 rounded">.env</code>.</p>
      </div>
    </div>
  );
}
