"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

interface TabConfig {
  key: string;
  judul: string;
  endpoint: string;
  kolom: { key: string; label: string; tipe: "text" | "number" | "textarea" }[];
  tampil: (r: Record<string, unknown>) => string;
}

const TABS: TabConfig[] = [
  {
    key: "paket",
    judul: "Paket",
    endpoint: "/api/paket",
    kolom: [
      { key: "nama", label: "Nama paket", tipe: "text" },
      { key: "harga", label: "Harga (Rp)", tipe: "number" },
      { key: "durasiMenit", label: "Durasi (menit)", tipe: "number" },
      { key: "deskripsi", label: "Deskripsi", tipe: "textarea" },
    ],
    tampil: (r) => `${r.nama} · ${rupiah(Number(r.harga))} · ${r.durasiMenit} mnt`,
  },
  {
    key: "addon",
    judul: "Addon",
    endpoint: "/api/addon",
    kolom: [
      { key: "nama", label: "Nama addon", tipe: "text" },
      { key: "harga", label: "Harga (Rp)", tipe: "number" },
    ],
    tampil: (r) => `${r.nama} · ${rupiah(Number(r.harga))}`,
  },
  {
    key: "fotografer",
    judul: "Fotografer",
    endpoint: "/api/fotografer",
    kolom: [
      { key: "nama", label: "Nama", tipe: "text" },
      { key: "noHp", label: "No. HP", tipe: "text" },
    ],
    tampil: (r) => `${r.nama} · ${r.noHp}`,
  },
  {
    key: "ruangan",
    judul: "Ruangan",
    endpoint: "/api/ruangan",
    kolom: [
      { key: "nama", label: "Nama ruangan", tipe: "text" },
      { key: "kapasitas", label: "Kapasitas (orang)", tipe: "number" },
    ],
    tampil: (r) => `${r.nama} · kapasitas ${r.kapasitas}`,
  },
];

function CrudTab({ cfg }: { cfg: TabConfig }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const muat = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(cfg.endpoint);
      if (!res.ok) throw new Error("gagal memuat");
      setRows(await res.json());
    } catch {
      setError("Gagal memuat data. Coba muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.endpoint]);

  const mulaiEdit = (r: Record<string, unknown>) => {
    const f: Record<string, string> = {};
    for (const k of cfg.kolom) f[k.key] = String(r[k.key] ?? "");
    setForm(f);
    setEditId(Number(r.id));
    setError("");
  };

  const batalEdit = () => {
    setForm({});
    setEditId(null);
    setError("");
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(editId ? `${cfg.endpoint}/${editId}` : cfg.endpoint, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(j.error ?? "Gagal menyimpan");
      return;
    }
    batalEdit();
    muat();
  };

  const hapus = async (r: Record<string, unknown>) => {
    if (!confirm(`Hapus "${cfg.tampil(r)}"?`)) return;
    const res = await fetch(`${cfg.endpoint}/${r.id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(j.error ?? "Gagal menghapus");
      return;
    }
    muat();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">{editId ? `Ubah ${cfg.judul}` : `Tambah ${cfg.judul}`}</h2>
        {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={simpan} className="space-y-3">
          {cfg.kolom.map((k) =>
            k.tipe === "textarea" ? (
              <div key={k.key}>
                <label className="mb-1 block text-sm text-slate-600">{k.label}</label>
                <textarea
                  value={form[k.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [k.key]: e.target.value })}
                  rows={3}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <div key={k.key}>
                <label className="mb-1 block text-sm text-slate-600">{k.label}</label>
                <input
                  type={k.tipe}
                  value={form[k.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [k.key]: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            )
          )}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              {editId ? "Simpan Perubahan" : "Tambah"}
            </button>
            {editId && (
              <button type="button" onClick={batalEdit} className="rounded border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Daftar {cfg.judul}</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada data.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={String(r.id)} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm">{cfg.tampil(r)}</span>
                <span className="flex shrink-0 gap-2 text-sm">
                  <button onClick={() => mulaiEdit(r)} className="text-indigo-700 hover:underline">
                    Ubah
                  </button>
                  <button onClick={() => hapus(r)} className="text-red-700 hover:underline">
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function MasterPage() {
  const [aktif, setAktif] = useState(TABS[0].key);
  const cfg = TABS.find((t) => t.key === aktif) ?? TABS[0];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Master Data</h1>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setAktif(t.key)}
            className={`rounded px-4 py-2 text-sm font-semibold ${aktif === t.key ? "bg-indigo-600 text-white" : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            {t.judul}
          </button>
        ))}
      </div>
      <CrudTab key={cfg.key} cfg={cfg} />
    </div>
  );
}
