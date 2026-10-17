import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("joins simple rows", () => {
    expect(toCsv([["a", "b"], ["1", "2"]])).toBe("a,b\r\n1,2");
  });

  it("quotes fields containing commas, quotes and newlines", () => {
    const out = toCsv([["name, with comma", 'say "hi"', "line1\nline2"]]);
    expect(out).toContain('"name, with comma"');
    expect(out).toContain('"say ""hi"""');
    expect(out).toContain('"line1\nline2"');
  });

  it("renders null and undefined as empty cells", () => {
    expect(toCsv([["x", null, undefined]])).toBe("x,,");
  });
});
