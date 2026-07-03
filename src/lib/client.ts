"use client";

const DEFAULT_TEMPLATES = [
  { id: "received", name: "Application received", subject: "We received your application — {{role}} at {{company}}", body: "Hi {{name}},\n\nThanks for applying for the {{role}} role at {{company}}. We've received your application and our team is reviewing it now. We'll be in touch with next steps soon.\n\nWarm regards,\nThe {{company}} Talent Team" },
  { id: "interview", name: "Interview invitation", subject: "Let's talk — {{role}} interview at {{company}}", body: "Hi {{name}},\n\nWe enjoyed reviewing your application for the {{role}} role and would love to schedule a conversation. Could you share a few time slots that work for you this week?\n\nLooking forward to it,\nThe {{company}} Talent Team" },
  { id: "offer", name: "Offer", subject: "An offer for you — {{role}} at {{company}}", body: "Hi {{name}},\n\nWe're delighted to extend an offer for the {{role}} role at {{company}}. We were impressed throughout the process and believe you'll do great things here. Let's find time to talk through the details.\n\nCongratulations,\nThe {{company}} Talent Team" },
  { id: "rejected", name: "Respectful no", subject: "Update on your {{role}} application", body: "Hi {{name}},\n\nThank you for the time you put into applying for the {{role}} role at {{company}}. After careful consideration we've decided to move forward with other candidates. This was a tough call, and we'd genuinely welcome a future application from you.\n\nWith appreciation,\nThe {{company}} Talent Team" },
];

const DEFAULT_JOBS = [
  { id: "job1", title: "Senior Frontend Engineer", department: "Engineering", location: "Bengaluru · Hybrid", minExperience: 4, requiredSkills: ["React", "TypeScript", "CSS", "Next.js", "Testing"], description: "Own the web experience end to end and mentor the frontend guild.", open: true, createdAt: new Date().toISOString() },
  { id: "job2", title: "Product Designer", department: "Design", location: "Remote", minExperience: 3, requiredSkills: ["Figma", "UI Design", "Prototyping", "User Research"], description: "Shape product flows from research through polished, shippable UI.", open: true, createdAt: new Date().toISOString() },
  { id: "job3", title: "Data Analyst", department: "Analytics", location: "Gurugram", minExperience: 2, requiredSkills: ["SQL", "Python", "Excel", "Tableau", "Statistics"], description: "Turn raw product and revenue data into decisions leadership can act on.", open: true, createdAt: new Date().toISOString() },
];

const DEFAULT_CANDIDATES = [
  { id: "cand1", name: "Aanya Sharma", email: "aanya.sharma@example.com", phone: "+91 90000 11111", role: "Senior Frontend Engineer", location: "Bengaluru", experience: 5, skills: ["React", "TypeScript", "CSS", "Next.js"], status: "new", notes: "Strong portfolio, led a design-system migration.", createdAt: new Date().toISOString() },
  { id: "cand2", name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 90000 22222", role: "Senior Frontend Engineer", location: "Pune", experience: 3, skills: ["React", "JavaScript", "CSS"], status: "screening", notes: "Eager, needs TypeScript depth.", createdAt: new Date().toISOString() },
  { id: "cand3", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 90000 33333", role: "Product Designer", location: "Remote", experience: 4, skills: ["Figma", "UI Design", "Prototyping", "User Research"], status: "interview", notes: "Excellent research case studies.", createdAt: new Date().toISOString() },
  { id: "cand4", name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91 90000 44444", role: "Data Analyst", location: "Gurugram", experience: 3, skills: ["SQL", "Python", "Tableau", "Statistics"], status: "new", notes: "Built dashboards at a fintech startup.", createdAt: new Date().toISOString() },
  { id: "cand5", name: "Sara Khan", email: "sara.khan@example.com", phone: "+91 90000 55555", role: "Product Designer", location: "Mumbai", experience: 2, skills: ["Figma", "UI Design", "Illustration"], status: "new", notes: "Great visual sense, lighter on research.", createdAt: new Date().toISOString() },
  { id: "cand6", name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 90000 66666", role: "Data Analyst", location: "Hyderabad", experience: 1, skills: ["SQL", "Excel", "Python"], status: "screening", notes: "Junior, sharp with SQL.", createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS = {
  company: "COMPANY",
  autoAck: true,
  geminiConfigured: false,
};

function initDb() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("hireflow_jobs")) {
    localStorage.setItem("hireflow_jobs", JSON.stringify(DEFAULT_JOBS));
  }
  if (!localStorage.getItem("hireflow_candidates")) {
    localStorage.setItem("hireflow_candidates", JSON.stringify(DEFAULT_CANDIDATES));
  }
  if (!localStorage.getItem("hireflow_templates")) {
    localStorage.setItem("hireflow_templates", JSON.stringify(DEFAULT_TEMPLATES));
  }
  if (!localStorage.getItem("hireflow_settings")) {
    localStorage.setItem("hireflow_settings", JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem("hireflow_emails")) {
    localStorage.setItem("hireflow_emails", JSON.stringify([]));
  }
}

// Check if running on GitHub Pages
const isStaticPages = typeof window !== "undefined" && (
  window.location.hostname.endsWith("github.io") || 
  window.location.search.includes("mock=true") || 
  window.location.pathname.includes("/HIREFLOW-DASHBOARD")
);

async function mockReq(url: string, options?: RequestInit): Promise<any> {
  initDb();
  const method = options?.method || "GET";
  const body = (options?.body && typeof options.body === "string") ? JSON.parse(options.body) : null;
  const path = url.split("?")[0];

  const getList = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
  const saveList = (key: string, list: any) => localStorage.setItem(key, JSON.stringify(list));

  if (path === "/api/auth/login") return { success: true };
  if (path === "/api/auth/logout") return { success: true };

  if (path === "/api/settings") {
    if (method === "GET") return JSON.parse(localStorage.getItem("hireflow_settings") || "{}");
    if (method === "PUT" || method === "POST") {
      const current = JSON.parse(localStorage.getItem("hireflow_settings") || "{}");
      const updated = { ...current, ...body };
      localStorage.setItem("hireflow_settings", JSON.stringify(updated));
      return updated;
    }
  }

  if (path === "/api/templates") {
    if (method === "GET") return getList("hireflow_templates");
    if (method === "PUT" || method === "POST" || method === "PATCH") {
      const list = getList("hireflow_templates");
      const index = list.findIndex((t: any) => t.id === body.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        saveList("hireflow_templates", list);
        return list[index];
      }
      return body;
    }
  }

  if (path === "/api/jobs") {
    if (method === "GET") return getList("hireflow_jobs");
    if (method === "POST") {
      const list = getList("hireflow_jobs");
      const newJob = {
        id: "job_" + Math.random().toString(36).substr(2, 9),
        title: body.title,
        department: body.department,
        location: body.location,
        minExperience: Number(body.minExperience || 0),
        requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : [],
        description: body.description || "",
        open: true,
        createdAt: new Date().toISOString(),
      };
      list.unshift(newJob);
      saveList("hireflow_jobs", list);
      return newJob;
    }
  }

  if (path.startsWith("/api/jobs/")) {
    const id = path.split("/").pop();
    const list = getList("hireflow_jobs");
    const index = list.findIndex((j: any) => j.id === id);

    if (method === "PATCH") {
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        saveList("hireflow_jobs", list);
        return list[index];
      }
      throw new Error("Job not found");
    }
    if (method === "DELETE") {
      if (index !== -1) {
        list.splice(index, 1);
        saveList("hireflow_jobs", list);
        return null;
      }
      throw new Error("Job not found");
    }
  }

  if (path === "/api/candidates") {
    if (method === "GET") return getList("hireflow_candidates");
    if (method === "POST") {
      const list = getList("hireflow_candidates");
      const newCand = {
        id: "cand_" + Math.random().toString(36).substr(2, 9),
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        role: body.role,
        location: body.location || "",
        experience: Number(body.experience || 0),
        skills: Array.isArray(body.skills) ? body.skills : [],
        status: body.status || "new",
        notes: body.notes || "",
        createdAt: new Date().toISOString(),
      };
      list.unshift(newCand);
      saveList("hireflow_candidates", list);

      const settings = JSON.parse(localStorage.getItem("hireflow_settings") || "{}");
      if (settings.autoAck) {
        const templates = getList("hireflow_templates");
        const t = templates.find((x: any) => x.id === "received");
        if (t) {
          const emailLogs = getList("hireflow_emails");
          const companyName = settings.company || "COMPANY";
          const subject = t.subject.replace("{{role}}", newCand.role).replace("{{company}}", companyName);
          const bodyText = t.body.replace("{{name}}", newCand.name).replace("{{role}}", newCand.role).replace("{{company}}", companyName);
          emailLogs.unshift({
            id: "email_" + Math.random().toString(36).substr(2, 9),
            candidateId: newCand.id,
            candidateName: newCand.name,
            candidateEmail: newCand.email,
            subject,
            body: bodyText,
            createdAt: new Date().toISOString(),
          });
          saveList("hireflow_emails", emailLogs);
        }
      }
      return newCand;
    }
  }

  if (path.startsWith("/api/candidates/")) {
    const id = path.split("/").pop();
    const list = getList("hireflow_candidates");
    const index = list.findIndex((c: any) => c.id === id);

    if (method === "PATCH") {
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        saveList("hireflow_candidates", list);
        return list[index];
      }
      throw new Error("Candidate not found");
    }
    if (method === "DELETE") {
      if (index !== -1) {
        list.splice(index, 1);
        saveList("hireflow_candidates", list);
        return null;
      }
      throw new Error("Candidate not found");
    }
  }

  if (path === "/api/emails") {
    if (method === "GET") return getList("hireflow_emails");
    if (method === "POST") {
      const emailLogs = getList("hireflow_emails");
      const newEmail = {
        id: "email_" + Math.random().toString(36).substr(2, 9),
        candidateId: body.candidateId,
        candidateName: body.candidateName,
        candidateEmail: body.candidateEmail,
        subject: body.subject,
        body: body.body,
        createdAt: new Date().toISOString(),
      };
      emailLogs.unshift(newEmail);
      saveList("hireflow_emails", emailLogs);
      return newEmail;
    }
  }

  throw new Error(`404: Route ${method} ${path} not found in mock API`);
}

async function mockUpload(url: string, form: FormData): Promise<any> {
  const path = url.split("?")[0];
  if (path === "/api/parse") {
    const file = form.get("file") as File;
    let name = "John Doe";
    let email = "john.doe@example.com";
    let phone = "+91 99999 88888";
    let experience = 3;
    let skills = ["React", "TypeScript", "CSS"];
    
    if (file && typeof file.name === "string") {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ")
        .replace(/resume/gi, "")
        .trim();
      if (cleanName) {
        name = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
      
      const allPossibleSkills = [
        ["React", "TypeScript", "Next.js", "Tailwind CSS", "JavaScript"],
        ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping"],
        ["SQL", "Python", "Tableau", "Pandas", "Machine Learning"],
        ["Node.js", "Express", "PostgreSQL", "Docker", "AWS"],
        ["HTML", "CSS", "Sass", "Webpack", "Git"]
      ];
      const randomIndex = Math.floor(Math.random() * allPossibleSkills.length);
      skills = allPossibleSkills[randomIndex];
      experience = Math.floor(Math.random() * 6) + 1;
      email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      results: [
        {
          name,
          email,
          phone,
          location: "Bengaluru",
          experience,
          skills,
          notes: "Auto-extracted from uploaded résumé."
        }
      ]
    };
  }
  throw new Error(`404: Route POST ${path} not found in mock upload`);
}

async function req(url: string, options?: RequestInit) {
  if (isStaticPages) {
    return mockReq(url, options);
  }
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
    if (isStaticPages) {
      return mockUpload(url, form);
    }
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
      let msg = `Upload failed (${res.status})`;
      try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
};
