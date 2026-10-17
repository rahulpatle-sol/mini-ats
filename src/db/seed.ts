import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { candidateNotes, candidates, jobs, stageEvents, users } from "./schema";
import { hashPassword } from "../lib/auth";

type Stage = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing. Add it to .env");
const db = drizzle(neon(url));

let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]!;

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "admin123";

const people = [
  "Aarav Sharma", "Diya Patel", "Rohan Verma", "Ananya Iyer", "Kabir Singh", "Meera Nair",
  "Vihaan Gupta", "Isha Reddy", "Arjun Mehta", "Saanvi Joshi", "Aditya Rao", "Priya Desai",
  "Karan Malhotra", "Tara Kapoor", "Neil Fernandes", "Riya Chawla", "Dev Bansal", "Nisha Menon",
  "Yash Agarwal", "Pooja Kulkarni", "Harsh Tiwari", "Sneha Pillai", "Manav Saxena", "Kavya Bhatt",
  "Ishaan Das", "Lakshmi Krishnan", "Rahul Chauhan", "Ira Banerjee",
];

const departments: Record<string, string> = {
  "Frontend Engineer": "Engineering",
  "Backend Engineer": "Engineering",
  "Full-Stack Developer": "Engineering",
  "Product Designer": "Design",
  "Data Analyst": "Analytics",
  "HR Executive": "People",
};

const roles: Record<string, string[]> = {
  "Frontend Engineer": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Testing"],
  "Backend Engineer": ["Node.js", "PostgreSQL", "REST APIs", "Docker", "Redis"],
  "Full-Stack Developer": ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"],
  "Product Designer": ["Figma", "Prototyping", "Design systems", "User research"],
  "Data Analyst": ["SQL", "Python", "Tableau", "Excel", "Statistics"],
  "HR Executive": ["Recruitment", "Onboarding", "Payroll", "Communication"],
};
const sources = ["LinkedIn", "Referral", "Job board", "Company website", "Campus"];
const path: Stage[] = ["applied", "screening", "interview", "offer", "hired"];
const weights: Stage[] = [
  "applied", "applied", "applied", "screening", "screening", "screening",
  "interview", "interview", "interview", "offer", "offer", "hired", "hired", "rejected", "rejected", "rejected",
];
const day = 86_400_000;

async function main() {
  const now = Date.now();

  // --- ensure demo user exists ---
  let [demoUser] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (!demoUser) {
    const uid = crypto.randomUUID();
    await db.insert(users).values({
      id: uid,
      email: DEMO_EMAIL,
      name: "Demo Admin",
      passwordHash: hashPassword(DEMO_PASSWORD),
    });
    demoUser = { id: uid, email: DEMO_EMAIL, name: "Demo Admin", passwordHash: "", createdAt: new Date() };
    console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user exists: ${DEMO_EMAIL}`);
  }
  const uid = demoUser.id;

  const cRows: (typeof candidates.$inferInsert)[] = [];
  const eRows: (typeof stageEvents.$inferInsert)[] = [];
  const nRows: (typeof candidateNotes.$inferInsert)[] = [];

  const jobRows = Object.keys(roles).map((title) => ({
    id: crypto.randomUUID(),
    userId: uid,
    title,
    department: departments[title] ?? null,
    status: "open" as const,
  }));
  const jobIdByTitle = new Map(jobRows.map((j) => [j.title, j.id]));

  people.forEach((name, i) => {
    const id = crypto.randomUUID();
    const position = pick(Object.keys(roles));
    const skills = Array.from(new Set(Array.from({ length: 2 + Math.floor(rand() * 3) }, () => pick(roles[position]!))));
    const createdAt = new Date(now - Math.floor(rand() * 54 + 1) * day - Math.floor(rand() * day));
    const final = pick(weights);

    let t = createdAt.getTime();
    let prev: Stage | null = null;
    const steps: Stage[] = final === "rejected" ? path.slice(0, 1 + Math.floor(rand() * 3)) : path.slice(0, path.indexOf(final) + 1);
    if (final === "rejected") steps.push("rejected");

    for (const s of steps) {
      if (prev) t += Math.floor(rand() * 5 + 1) * day;
      t = Math.min(t, now - 60_000);
      eRows.push({
        candidateId: id,
        fromStage: prev,
        toStage: s,
        note: prev === null ? "Candidate added" : s === "rejected" ? "Not a fit for the role right now" : null,
        createdAt: new Date(t),
      });
      prev = s;
    }

    const first = name.split(" ")[0]!.toLowerCase();
    const last = name.split(" ")[1]!.toLowerCase();
    cRows.push({
      id,
      userId: uid,
      name,
      email: `${first}.${last}${i}@example.com`,
      phone: `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
      jobId: jobIdByTitle.get(position)!,
      stage: final,
      skills,
      experienceYears: Math.floor(rand() * 9),
      source: pick(sources),
      resumeUrl: null,
      createdAt,
      updatedAt: new Date(t),
    });
  });

  cRows.forEach((c) => {
    if (rand() > 0.6) {
      nRows.push({ candidateId: c.id!, body: "Strong communicator. Worth a closer look.", author: "seed", createdAt: c.createdAt });
    }
  });

  await db.delete(candidates).where(eq(candidates.userId, uid));
  await db.delete(jobs).where(eq(jobs.userId, uid));
  await db.insert(jobs).values(jobRows);
  await db.insert(candidates).values(cRows);
  await db.insert(stageEvents).values(eRows);
  if (nRows.length) await db.insert(candidateNotes).values(nRows);
  console.log(`Seeded ${jobRows.length} jobs, ${cRows.length} candidates, ${eRows.length} stage events and ${nRows.length} notes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
