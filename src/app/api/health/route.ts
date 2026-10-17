import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  const info = {
    nodeEnv: process.env.NODE_ENV ?? null,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    authSecretLen: process.env.AUTH_SECRET?.length ?? 0,
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
  };

  try {
    const db = getDb();
    const rows = await db.select({ id: users.id }).from(users).limit(1);
    return Response.json({ ...info, db: "ok", userCountSample: rows.length });
  } catch (e) {
    const cause = (e as { cause?: Error })?.cause;
    return Response.json(
      {
        ...info,
        db: "error",
        error: (e as Error).message?.slice(0, 300),
        cause: cause?.message?.slice(0, 300) ?? null,
        causeCode: (cause as { code?: string })?.code ?? null,
      },
      { status: 500 },
    );
  }
}
