import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: { default: "Mini ATS", template: "%s · Mini ATS" },
  description: "Track candidates through your hiring pipeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <div className="md:flex">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
