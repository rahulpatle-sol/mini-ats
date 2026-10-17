import { describe, expect, it } from "vitest";
import { checkResumeFile, matchesSignature, MAX_RESUME_BYTES } from "@/lib/resume";

describe("checkResumeFile", () => {
  it("rejects empty files", () => {
    expect(checkResumeFile({ name: "cv.pdf", size: 0 })).toEqual({ error: "That file is empty." });
  });

  it("rejects oversized files", () => {
    expect(checkResumeFile({ name: "cv.pdf", size: MAX_RESUME_BYTES + 1 })).toEqual({
      error: "Resume must be 3 MB or smaller.",
    });
  });

  it("rejects wrong extension", () => {
    expect(checkResumeFile({ name: "cv.png", size: 100 })).toEqual({ error: "Upload a PDF, DOC or DOCX file." });
  });

  it("accepts pdf, doc, docx", () => {
    expect(checkResumeFile({ name: "cv.pdf", size: 100 })).toEqual({ contentType: "application/pdf" });
    expect(checkResumeFile({ name: "cv.doc", size: 100 })).toEqual({ contentType: "application/msword" });
    expect(checkResumeFile({ name: "cv.docx", size: 100 })).toEqual({
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  });
});

describe("matchesSignature", () => {
  it("detects PDF magic bytes", () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(matchesSignature("pdf", pdf)).toBe(true);
    expect(matchesSignature("pdf", new Uint8Array([0x89, 0x50]))).toBe(false);
  });

  it("detects DOCX (zip) signature", () => {
    const docx = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    expect(matchesSignature("docx", docx)).toBe(true);
  });

  it("detects DOC (OLE2) signature", () => {
    const doc = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]);
    expect(matchesSignature("doc", doc)).toBe(true);
  });
});
