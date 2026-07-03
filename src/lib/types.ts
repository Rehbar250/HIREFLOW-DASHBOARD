export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  experience: number;
  skills: string[];
  status: string;
  notes: string;
  source: string;
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  minExperience: number;
  requiredSkills: string[];
  description: string;
  open: boolean;
  createdAt: string;
};

export type EmailLog = {
  id: string;
  to: string;
  candidateName: string;
  subject: string;
  body: string;
  template: string;
  auto: boolean;
  delivered: boolean;
  createdAt: string;
};

export type Template = { id: string; name: string; subject: string; body: string };

export type Draft = {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  experience: number;
  skills: string[];
  source?: string;
  note?: string | null;
};
