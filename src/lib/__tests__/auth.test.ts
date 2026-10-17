import { describe, expect, it } from "vitest";
import { safeNext, credentialsMatch } from "@/lib/auth";

describe("safeNext", () => {
  it("allows same-origin paths", () => {
    expect(safeNext("/candidates")).toBe("/candidates");
    expect(safeNext("/")).toBe("/");
  });

  it("blocks open redirects", () => {
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
  });

  it("falls back for non-strings", () => {
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext(null)).toBe("/");
    expect(safeNext(123)).toBe("/");
  });
});

describe("credentialsMatch", () => {
  it("matches correct email and password (case-insensitive email)", () => {
    process.env.ADMIN_EMAIL = "Admin@Example.com";
    process.env.ADMIN_PASSWORD = "s3cret";
    expect(credentialsMatch("admin@example.com", "s3cret")).toBe(true);
    expect(credentialsMatch("ADMIN@example.com", "s3cret")).toBe(true);
    expect(credentialsMatch("admin@example.com", "wrong")).toBe(false);
    expect(credentialsMatch("other@example.com", "s3cret")).toBe(false);
  });

  it("fails when env vars are missing", () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    expect(credentialsMatch("a@b.c", "x")).toBe(false);
  });
});
