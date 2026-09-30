"use client";

import { useState } from "react";

export default function UploadPanel({ bookingId, dibatalkan }: { bookingId: number; dibatalkan: boolean }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!files || files.length === 0) return;
    setLoading(true);
    const baris: string[] = [];
    try {
      for (const file of Array.from(files)) {
        // Langkah 1: minta presigned upload URL
        const r1 = await fetch(`/api/booking/${bookingId}/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, ukuran_kb: Math.max(1, Math.round(file.size / 1024)) }),
        });
        const j1 = await r1.json().catch(() => ({}));
        if (!r1.ok) {
          baris.push(`${file.name}: GAGAL (${j1.error ?? "tidak bisa minta URL"})`);
          continue;
        }
        // Langkah 2: PUT binary langsung ke URL tersebut
        const r2 = await fetch(j1.upload_url, { method: "PUT", body: file });
        if (!r2.ok) {
          const j2 = await r2.json().catch(() => ({}));
          baris.push(`${file.name}: GAGAL (${j2.error ?? "upload gagal"})`);
          continue;
        }
        baris.push(`${file.name}: OK`);
      }
    } finally {
      setLoading(false);
      setLog(baris);
      setFiles(null);
    }
  };

  return (
    <div className="rounded bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold">Upload Hasil Foto</h2>
      {dibatalkan ? (
        <p className="text-sm text-slate-500">Booking dibatalkan, upload tidak tersedia.</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">
            Pola presigned-URL: aplikasi meminta URL upload sekali pakai (berlaku 15 menit),
            lalu file dikirim langsung dengan PUT. Bisa pilih beberapa file sekaligus.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="text-sm"
            />
            <button
              onClick={upload}
              disabled={loading || !files || files.length === 0}
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Mengupload..." : "Upload"}
            </button>
          </div>
          {log.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {log.map((l, i) => (
                <li key={i} className={l.includes("OK") ? "text-emerald-700" : "text-red-700"}>{l}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
