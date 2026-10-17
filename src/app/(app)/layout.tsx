import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);
  return (
    <div className="warm-ambient md:flex">
      <Sidebar email={session?.sub} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">{children}</div>
      </main>
    </div>
  );
}
