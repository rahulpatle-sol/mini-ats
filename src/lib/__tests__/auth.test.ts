import { describe, expect, it } from "vitest";
import { safeNext, hashPassword, verifyPassword } from "@/lib/auth";

describe("safeNext", () => {
  it("allows same-origin paths", () => {
    expect(safeNext("/candidates")).toBe("/candidates");
    expect(safeNext("/")).toBe("/");
    expect(safeNext("/dashboard")).toBe("/dashboard");
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

describe("password hashing", () => {
  it("hashes and verifies correctly", () => {
    const hash = hashPassword("s3cret-password");
    expect(hash).not.toContain("s3cret-password");
    expect(verifyPassword("s3cret-password", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", () => {
    expect(verifyPassword("x", "not-a-valid-hash")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });

  it("produces different hashes for the same password (salt)", () => {
    const a = hashPassword("same");
    const b = hashPassword("same");
    expect(a).not.toBe(b);
  });
});
