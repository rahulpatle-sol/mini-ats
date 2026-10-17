import { getResumeFile } from "@/lib/queries";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const file = await getResumeFile(id);
  if (!file) return new Response("Not found", { status: 404 });

  const inline = file.contentType === "application/pdf";
  const safeName = file.filename.replace(/[^\w.\- ]+/g, "_");
  return new Response(Buffer.from(file.data, "base64"), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
