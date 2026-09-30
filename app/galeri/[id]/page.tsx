"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTanggal } from "@/lib/format";

interface Foto {
  id: number;
  filename: string;
  ukuranKb: number;
  isFavorit: boolean;
  uploadedAt: string;
}

interface InfoBooking {
  id: number;
  klienNama: string;
  tanggal: string;
  statusBayar: string;
}

export default function GaleriPage({ params }: { params: { id: string } }) {
  const bookingId = params.id;
  const [info, setInfo] = useState<InfoBooking | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    const res = await fetch(`/api/galeri/${bookingId}/foto`);
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setError("Galeri tidak ditemukan.");
      setAuthed(false);
      return;
    }
    const j = await res.json();
    setInfo(j.booking);
    setFotos(j.fotos);
    setAuthed(true);
  }, [bookingId]);

  useEffect(() => {
    muat();
  }, [muat]);

  const masuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/galeri/${bookingId}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Password salah. Tanyakan password kepada studio foto Anda.");
      return;
    }
    setPassword("");
    muat();
  };

  const toggleFavorit = async (f: Foto) => {
    const res = await fetch(`/api/foto/${f.id}/favorit`, { method: "POST" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setFotos((prev) => prev.map((x) => (x.id === f.id ? { ...x, isFavorit: !!j.is_favorit } : x)));
    }
  };

  if (authed === null) {
    return <p className="py-10 text-center text-sm text-slate-500">Memuat galeri...</p>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="rounded bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold">Galeri Privat</h1>
          <p className="mt-2 text-sm text-slate-600">
            Galeri ini dilindungi password. Masukkan password yang diberikan studio foto.
          </p>
          {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <form onSubmit={masuk} className="mt-4 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password galeri"
              autoComplete="off"
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <button type="submit" className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Buka Galeri
            </button>
          </form>
        </div>
      </div>
    );
  }

  const lunas = info?.statusBayar === "lunas";
  const jumlahFavorit = fotos.filter((f) => f.isFavorit).length;

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Galeri {info?.klienNama}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sesi {info ? formatTanggal(info.tanggal) : ""} · {fotos.length} foto · {jumlahFavorit} favorit
        </p>
        {!lunas && (
          <p className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">
            File kualitas tinggi bisa diunduh setelah pembayaran lunas. Hubungi studio untuk pelunasan.
          </p>
        )}
      </div>

      {fotos.length === 0 ? (
        <div className="rounded bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Foto belum tersedia. Studio akan mengunggah hasil sesi Anda di sini.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((f) => (
            <div key={f.id} className="overflow-hidden rounded bg-white shadow-sm">
              <img
                src={`/api/foto/${f.id}/file`}
                alt={f.filename}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-xs text-slate-500">{f.filename}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleFavorit(f)}
                    aria-label={f.isFavorit ? "Hapus dari favorit" : "Tandai favorit"}
                    className={`rounded px-2 py-1 text-sm ${f.isFavorit ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    {f.isFavorit ? "★ Favorit" : "☆ Favorit"}
                  </button>
                  {lunas && (
                    <a
                      href={`/api/foto/${f.id}/download`}
                      className="rounded bg-emerald-600 px-2 py-1 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Unduh HD
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
