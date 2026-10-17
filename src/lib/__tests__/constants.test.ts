import { describe, expect, it } from "vitest";
import { canMove, isStage, allowedTargets } from "@/lib/constants";

describe("stage rules", () => {
  it("validates stage strings", () => {
    expect(isStage("applied")).toBe(true);
    expect(isStage("hired")).toBe(true);
    expect(isStage("bogus")).toBe(false);
    expect(isStage(42)).toBe(false);
  });

  it("hired is final", () => {
    expect(canMove("hired", "rejected")).toBe(false);
    expect(canMove("hired", "applied")).toBe(false);
    expect(allowedTargets("hired")).toEqual([]);
  });

  it("rejected can only reopen to applied", () => {
    expect(canMove("rejected", "applied")).toBe(true);
    expect(canMove("rejected", "interview")).toBe(false);
  });

  it("pipeline stages can move to any other", () => {
    expect(canMove("applied", "screening")).toBe(true);
    expect(canMove("applied", "hired")).toBe(true);
    expect(canMove("applied", "rejected")).toBe(true);
    expect(canMove("applied", "applied")).toBe(false); // same stage
  });
});
