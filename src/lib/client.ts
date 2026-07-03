"use client";

async function req(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (url: string) => req(url),
  post: (url: string, body: any) => req(url, { method: "POST", body: JSON.stringify(body) }),
  patch: (url: string, body: any) => req(url, { method: "PATCH", body: JSON.stringify(body) }),
  del: (url: string) => req(url, { method: "DELETE" }),
  upload: async (url: string, form: FormData) => {
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
      let msg = `Upload failed (${res.status})`;
      try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
};
