"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BayarButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const tandai = async () => {
    if (!confirm("Tandai booking ini sebagai LUNAS?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/${id}/bayar`, { method: "PATCH" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "Gagal menandai lunas");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={tandai}
      disabled={loading}
      className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? "Menyimpan..." : "Tandai Lunas"}
    </button>
  );
}
