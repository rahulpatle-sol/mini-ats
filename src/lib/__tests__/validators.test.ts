import { describe, expect, it } from "vitest";
import { candidateSchema, jobSchema, noteSchema } from "@/lib/validators";

const validCandidate = {
  name: "Aarav Sharma",
  email: "aarav@example.com",
  phone: "+91 98765 43210",
  jobId: "550e8400-e29b-41d4-a716-446655440000",
  skills: "React, TypeScript, React",
  experienceYears: "3",
  source: "LinkedIn",
  resumeUrl: "https://example.com/resume.pdf",
};

describe("candidateSchema", () => {
  it("accepts a valid candidate", () => {
    const result = candidateSchema.safeParse(validCandidate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(["React", "TypeScript"]); // deduped
      expect(result.data.experienceYears).toBe(3);
      expect(result.data.email).toBe("aarav@example.com");
    }
  });

  it("rejects bad email", () => {
    const result = candidateSchema.safeParse({ ...validCandidate, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid jobId", () => {
    const result = candidateSchema.safeParse({ ...validCandidate, jobId: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects negative experience", () => {
    const result = candidateSchema.safeParse({ ...validCandidate, experienceYears: "-1" });
    expect(result.success).toBe(false);
  });

  it("allows empty optional fields", () => {
    const result = candidateSchema.safeParse({
      ...validCandidate,
      phone: "",
      source: "",
      resumeUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.resumeUrl).toBeNull();
    }
  });
});

describe("jobSchema", () => {
  it("accepts open and closed", () => {
    expect(jobSchema.safeParse({ title: "Frontend Engineer", department: "Eng", status: "open" }).success).toBe(true);
    expect(jobSchema.safeParse({ title: "Frontend Engineer", department: "", status: "closed" }).success).toBe(true);
  });

  it("rejects short title", () => {
    expect(jobSchema.safeParse({ title: "A", department: "", status: "open" }).success).toBe(false);
  });

  it("rejects unknown status", () => {
    expect(jobSchema.safeParse({ title: "Frontend Engineer", department: "", status: "draft" }).success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("requires non-empty body", () => {
    expect(noteSchema.safeParse({ body: "" }).success).toBe(false);
    expect(noteSchema.safeParse({ body: "  Good communicator  " }).success).toBe(true);
  });

  it("caps length at 2000", () => {
    expect(noteSchema.safeParse({ body: "x".repeat(2001) }).success).toBe(false);
  });
});
