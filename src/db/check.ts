/** Simulates what Next.js server runtime sees. */
import "dotenv/config";

async function main() {
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL));
  console.log("AUTH_SECRET set:", Boolean(process.env.AUTH_SECRET), "len:", process.env.AUTH_SECRET?.length);

  const { getDb } = await import("@/db");
  try {
    const db = getDb();
    const { users } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(users).where(eq(users.email, "admin@example.com")).limit(1);
    console.log("QUERY OK:", rows.length, "row(s)");
  } catch (e: any) {
    console.error("QUERY FAILED:", e.message);
    console.error("cause:", e.cause?.message, e.cause?.code);
  }
}
main();
