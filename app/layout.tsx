import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Foto: Galeri Klien",
  description: "Booking sesi foto, upload hasil, galeri privat klien, dan pelunasan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-indigo-700">
              StudioFoto
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-indigo-700">
              Dashboard
            </Link>
            <Link href="/booking/baru" className="text-sm text-slate-600 hover:text-indigo-700">
              Booking Baru
            </Link>
            <Link href="/master" className="text-sm text-slate-600 hover:text-indigo-700">
              Master Data
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
