"use client";

import {
  SEED_APPLICATIONS,
  type Application,
  type AppStatus,
  type VisaCategory,
  VISA_TYPES,
} from "./data";

/* In-memory store with localStorage persistence so a demo survives reloads
   and applicant submissions show up in the officer queue. No real backend. */

const KEY = "vv-applications";
let memory: Application[] | null = null;

function load(): Application[] {
  if (memory) return memory;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        memory = JSON.parse(raw) as Application[];
        return memory;
      }
    } catch {
      /* ignore corrupt storage */
    }
  }
  memory = SEED_APPLICATIONS.map((a) => ({ ...a, timeline: [...a.timeline] }));
  persist();
  return memory;
}

function persist() {
  if (typeof window !== "undefined" && memory) {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  }
}

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function newReference(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `VE-2026-${n}`;
}

export interface DraftApplication {
  visaType: VisaCategory;
  firstName: string;
  lastName: string;
  nationality: string;
  sex: "M" | "F" | "X";
  dob: string;
  passportNo: string;
  passportExp: string;
  email: string;
  phone: string;
  purpose: string;
  arrival: string;
  departure: string;
  port: string;
  addressVe: string;
  documents: { passport: boolean; photo: boolean; support: boolean };
  verification?: { email: boolean; phone: boolean };
  paymentRef?: string;
}

export async function submitApplication(draft: DraftApplication): Promise<Application> {
  await delay(900);
  const now = new Date().toISOString();
  const app: Application = {
    ...draft,
    reference: newReference(),
    status: "submitted",
    submittedAt: now,
    timeline: [{ status: "submitted", at: now }],
  };
  const store = load();
  store.unshift(app);
  persist();
  return app;
}

export async function trackApplication(
  reference: string,
  lastName: string,
): Promise<Application | null> {
  await delay(500);
  const store = load();
  const ref = reference.trim().toUpperCase();
  const ln = lastName.trim().toLowerCase();
  return (
    store.find((a) => a.reference.toUpperCase() === ref && a.lastName.toLowerCase() === ln) ?? null
  );
}

export async function listApplications(): Promise<Application[]> {
  await delay(400);
  return [...load()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getApplication(reference: string): Promise<Application | null> {
  await delay(300);
  return load().find((a) => a.reference === reference) ?? null;
}

export async function decideApplication(
  reference: string,
  status: AppStatus,
  note?: string,
): Promise<Application | null> {
  await delay(500);
  const store = load();
  const app = store.find((a) => a.reference === reference);
  if (!app) return null;
  app.status = status;
  app.timeline.push({ status, at: new Date().toISOString(), note: note?.trim() || undefined });
  persist();
  return app;
}

export interface DashboardStats {
  pending: number;
  approvedToday: number;
  total: number;
  byType: { type: VisaCategory; count: number }[];
  recent: Application[];
}

export async function dashboardStats(): Promise<DashboardStats> {
  await delay(400);
  const store = load();
  const today = new Date().toISOString().slice(0, 10);
  const pending = store.filter((a) => a.status === "submitted" || a.status === "review").length;
  const approvedToday = store.filter(
    (a) => a.status === "approved" && a.timeline.some((e) => e.status === "approved" && e.at.slice(0, 10) === today),
  ).length;
  const byType = VISA_TYPES.map((v) => ({
    type: v.id,
    count: store.filter((a) => a.visaType === v.id).length,
  }));
  const recent = [...store].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);
  return { pending, approvedToday, total: store.length, byType, recent };
}

/* Officer auth lives in src/lib/auth.ts + /api/auth (real JWT sessions). */
