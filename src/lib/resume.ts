export const MAX_RESUME_BYTES = 3 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function extensionOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** Checks size and extension. Returns an error message or the content type to store. */
export function checkResumeFile(file: { name: string; size: number }): { error: string } | { contentType: string } {
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_RESUME_BYTES) return { error: "Resume must be 3 MB or smaller." };
  const type = TYPES[extensionOf(file.name)];
  if (!type) return { error: "Upload a PDF, DOC or DOCX file." };
  return { contentType: type };
}

/** Confirms the first bytes match the claimed format, so a renamed file is rejected. */
export function matchesSignature(ext: string, bytes: Uint8Array) {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (ext === "pdf") return starts([0x25, 0x50, 0x44, 0x46]); // %PDF
  if (ext === "docx") return starts([0x50, 0x4b]); // PK (zip)
  if (ext === "doc") return starts([0xd0, 0xcf, 0x11, 0xe0]); // OLE2
  return false;
}
