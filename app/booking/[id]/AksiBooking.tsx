"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AksiBooking({ id, status, statusBayar }: { id: number; status: string; statusBayar: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (url: string, body: unknown, tanya: string) => {
    if (!confirm(tanya)) return;
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "Gagal");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!confirm("Reset password galeri? Sesi klien yang sedang aktif akan keluar.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/${id}/reset-password`, { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error ?? "Gagal");
        return;
      }
      alert(`Password galeri baru: ${j.gallery_password}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {statusBayar !== "lunas" && status !== "batal" && (
        <button
          disabled={loading}
          onClick={() => patch(`/api/booking/${id}/bayar`, {}, "Tandai booking ini sebagai LUNAS?")}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Tandai Lunas
        </button>
      )}
      {status === "terjadwal" && (
        <button
          disabled={loading}
          onClick={() => patch(`/api/booking/${id}`, { status: "batal" }, "Batalkan booking ini?")}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Batalkan Booking
        </button>
      )}
      <button
        disabled={loading}
        onClick={resetPassword}
        className="rounded border px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Reset Password Galeri
      </button>
    </div>
  );
}
