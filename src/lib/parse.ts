import mammoth from "mammoth";
import { XMLParser } from "fast-xml-parser";
import { geminiExtract } from "./gemini";
import { COMMON_SKILLS } from "./constants";
import type { Draft } from "./types";

function splitSkills(s: string): string[] {
  return (s || "").split(",").map((x) => x.trim()).filter(Boolean);
}

function normalize(o: any, jobTitles: string[]): Draft {
  o = o || {};
  let skills = o.skills;
  if (typeof skills === "string") skills = splitSkills(skills);
  if (!Array.isArray(skills)) skills = [];
  skills = skills.map((s: any) => String(s).trim()).filter(Boolean);
  let role = String(o.role || "").trim();
  const match = jobTitles.find((t) => role && t.toLowerCase() === role.toLowerCase());
  if (match) role = match;
  return {
    name: String(o.name || "").trim(),
    email: String(o.email || "").trim(),
    phone: String(o.phone || "").trim(),
    location: String(o.location || "").trim(),
    role,
    experience: Number(o.experience) || 0,
    skills,
  };
}

function mergePref(primary: any, secondary: any) {
  const out = { ...secondary };
  for (const k in primary) {
    const v = primary[k];
    const empty =
      v === undefined || v === null ||
      (typeof v === "string" && !v.trim()) ||
      (Array.isArray(v) && v.length === 0);
    if (!empty) out[k] = v;
  }
  return out;
}

function heuristic(text: string, knownSkills: string[]): Draft {
  const t = text || "";
  const email = (t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || "";
  const phone = (t.match(/(\+?\d[\d\s().-]{7,}\d)/) || [])[0] || "";
  const em = t.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const experience = em ? Number(em[1]) : 0;
  const low = t.toLowerCase();
  const skills = knownSkills.filter((s) => low.includes(s.toLowerCase()));
  const name =
    t.split(/\r?\n/).map((l) => l.trim())
      .find((l) => l && !l.includes("@") && !/\d{4}/.test(l) && l.length > 1 && l.length < 60) || "";
  return { name, email, phone, experience, skills, role: "", location: "" };
}

async function extractFields(
  input: { text?: string; base64Pdf?: string },
  jobTitles: string[],
  knownSkills: string[]
): Promise<Draft> {
  let ai: any = null;
  try {
    ai = await geminiExtract(input);
  } catch {
    ai = null;
  }
  const heur = input.base64Pdf ? {} : heuristic(input.text || "", knownSkills);
  const merged = mergePref(ai ? normalize(ai, jobTitles) : {}, heur);
  return normalize(merged, jobTitles);
}

function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === "," || ch === "\t") { row.push(cur); cur = ""; }
    else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function parseCSV(text: string): any[] {
  const rows = csvRows(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (names: string[]) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };
  const ci = {
    name: col(["name", "full name", "candidate", "candidate name"]),
    email: col(["email", "e-mail", "email address"]),
    phone: col(["phone", "mobile", "contact", "phone number"]),
    role: col(["role", "position", "title", "applied for", "job title"]),
    location: col(["location", "city"]),
    exp: col(["experience", "years", "years of experience", "exp"]),
    skills: col(["skills", "skill set", "skillset"]),
  };
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] || "").trim() : "");
  return rows.slice(1).filter((r) => r.some((c) => c && c.trim())).map((r) => ({
    name: cell(r, ci.name), email: cell(r, ci.email), phone: cell(r, ci.phone),
    role: cell(r, ci.role), location: cell(r, ci.location),
    experience: Number((cell(r, ci.exp).match(/\d+/) || [0])[0]),
    skills: splitSkills(cell(r, ci.skills).replace(/;/g, ",")),
  }));
}

function collectRecords(node: any, out: any[]) {
  if (Array.isArray(node)) { node.forEach((n) => collectRecords(n, out)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (["candidate", "applicant", "person", "resume"].includes(k.toLowerCase())) {
        (Array.isArray(v) ? v : [v]).forEach((item) => out.push(item));
      } else {
        collectRecords(v, out);
      }
    }
  }
}
function fieldFrom(rec: any, names: string[]): string {
  if (!rec || typeof rec !== "object") return "";
  for (const k of Object.keys(rec)) {
    if (names.includes(k.toLowerCase())) {
      const v = rec[k];
      if (v != null && typeof v !== "object") return String(v);
    }
  }
  return "";
}
function parseXML(text: string): any[] | null {
  try {
    const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });
    const obj = parser.parse(text);
    const records: any[] = [];
    collectRecords(obj, records);
    const list = records.length ? records : [obj];
    const mapped = list.map((rec) => ({
      name: fieldFrom(rec, ["name", "fullname", "candidatename"]),
      email: fieldFrom(rec, ["email", "emailaddress", "mail"]),
      phone: fieldFrom(rec, ["phone", "mobile", "contact", "telephone"]),
      role: fieldFrom(rec, ["role", "position", "title", "jobtitle", "appliedfor"]),
      location: fieldFrom(rec, ["location", "city", "address"]),
      experience: Number((fieldFrom(rec, ["experience", "yearsofexperience", "exp"]).match(/\d+/) || [0])[0]),
      skills: splitSkills(fieldFrom(rec, ["skills", "skill", "skillset"])),
    }));
    const useful = mapped.filter((m) => m.name || m.email);
    return useful.length ? useful : null;
  } catch {
    return null;
  }
}

export async function parseUpload(
  file: { name: string; buffer: Buffer },
  jobTitles: string[]
): Promise<Draft[]> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const knownSkills = Array.from(new Set([...COMMON_SKILLS]));

  if (ext === "csv" || ext === "tsv") {
    return parseCSV(file.buffer.toString("utf8")).map((r) => normalize(r, jobTitles));
  }
  if (ext === "txt") {
    return [await extractFields({ text: file.buffer.toString("utf8") }, jobTitles, knownSkills)];
  }
  if (ext === "xml") {
    const text = file.buffer.toString("utf8");
    const structured = parseXML(text);
    if (structured && structured.length) return structured.map((r) => normalize(r, jobTitles));
    return [await extractFields({ text }, jobTitles, knownSkills)];
  }
  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return [await extractFields({ text: result.value }, jobTitles, knownSkills)];
  }
  if (ext === "doc") {
    throw new Error("Old .doc format isn't supported. Re-save as .docx or PDF.");
  }
  if (ext === "pdf") {
    return [await extractFields({ base64Pdf: file.buffer.toString("base64") }, jobTitles, knownSkills)];
  }
  throw new Error("Unsupported file type. Use PDF, DOCX, XML, or CSV.");
}
