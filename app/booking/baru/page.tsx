"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rupiah } from "@/lib/format";

interface Paket { id: number; nama: string; harga: number; durasiMenit: number; deskripsi?: string }
interface Addon { id: number; nama: string; harga: number }
interface Fotografer { id: number; nama: string }
interface Ruangan { id: number; nama: string; kapasitas: number }

export default function BookingBaruPage() {
  const router = useRouter();
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [fgs, setFgs] = useState<Fotografer[]>([]);
  const [rgs, setRgs] = useState<Ruangan[]>([]);
  const [form, setForm] = useState({
    paket_id: "", fotografer_id: "", ruangan_id: "",
    tanggal: "", jam_mulai: "", klien_nama: "", klien_wa: "",
  });
  const [addonDipilih, setAddonDipilih] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<{ id: number; gallery_password: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [p, a, f, r] = await Promise.all([
        fetch("/api/paket").then((x) => x.json()),
        fetch("/api/addon").then((x) => x.json()),
        fetch("/api/fotografer").then((x) => x.json()),
        fetch("/api/ruangan").then((x) => x.json()),
      ]);
      setPakets(p); setAddons(a); setFgs(f); setRgs(r);
    })();
  }, []);

  const paketAktif = pakets.find((p) => p.id === Number(form.paket_id));
  const totalAddon = addonDipilih.reduce((s, id) => s + (addons.find((a) => a.id === id)?.harga ?? 0), 0);
  const total = (paketAktif?.harga ?? 0) + totalAddon;

  const toggleAddon = (id: number) =>
    setAddonDipilih((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, addons: addonDipilih }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "Gagal membuat booking");
        return;
      }
      setHasil({ id: j.id, gallery_password: j.galleryPassword });
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full rounded border px-3 py-2 text-sm";
  const lbl = "mb-1 block text-sm text-slate-600";

  if (hasil) {
    return (
      <div className="mx-auto max-w-lg rounded bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-emerald-700">Booking Berhasil Dibuat</h1>
        <p className="mt-3 text-sm text-slate-600">
          Berikan password galeri ini kepada klien agar bisa membuka hasil fotonya:
        </p>
        <p className="mt-2 rounded bg-slate-100 px-4 py-3 font-mono text-2xl font-bold tracking-widest">
          {hasil.gallery_password}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/booking/${hasil.id}`} className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Kelola Booking
          </Link>
          <button onClick={() => router.push("/")} className="rounded border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Booking Sesi Baru</h1>
      <form onSubmit={simpan} className="space-y-4 rounded bg-white p-6 shadow-sm">
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={lbl}>Klien (nama)</label>
            <input className={inp} value={form.klien_nama} onChange={(e) => setForm({ ...form, klien_nama: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>No. WA klien</label>
            <input className={inp} value={form.klien_wa} onChange={(e) => setForm({ ...form, klien_wa: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Tanggal</label>
            <input type="date" className={inp} value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Jam mulai</label>
            <input type="time" className={inp} value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Paket</label>
            <select className={inp} value={form.paket_id} onChange={(e) => setForm({ ...form, paket_id: e.target.value })}>
              <option value="">Pilih paket</option>
              {pakets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} · {rupiah(p.harga)} · {p.durasiMenit} mnt
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Fotografer</label>
            <select className={inp} value={form.fotografer_id} onChange={(e) => setForm({ ...form, fotografer_id: e.target.value })}>
              <option value="">Pilih fotografer</option>
              {fgs.map((f) => (
                <option key={f.id} value={f.id}>{f.nama}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Ruangan</label>
            <select className={inp} value={form.ruangan_id} onChange={(e) => setForm({ ...form, ruangan_id: e.target.value })}>
              <option value="">Pilih ruangan</option>
              {rgs.map((r) => (
                <option key={r.id} value={r.id}>{r.nama} (kapasitas {r.kapasitas})</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={lbl}>Addon (opsional)</label>
          <div className="space-y-2">
            {addons.map((a) => (
              <label key={a.id} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                <input type="checkbox" checked={addonDipilih.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                <span className="flex-1">{a.nama}</span>
                <span className="font-semibold">{rupiah(a.harga)}</span>
              </label>
            ))}
            {addons.length === 0 && <p className="text-sm text-slate-500">Belum ada addon.</p>}
          </div>
        </div>
        <div className="rounded bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Paket{paketAktif ? ` (${paketAktif.durasiMenit} menit)` : ""}</span>
            <span>{rupiah(paketAktif?.harga ?? 0)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Addon</span>
            <span>{rupiah(totalAddon)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span>{rupiah(total)}</span>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Buat Booking"}
        </button>
      </form>
    </div>
  );
}
