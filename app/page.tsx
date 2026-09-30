import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTanggal, rupiah, statusLabel } from "@/lib/format";
import { parseAddons } from "@/lib/booking";
import BayarButton from "./BayarButton";

export default async function Home() {
  const daftar = await prisma.booking.findMany({
    orderBy: { id: "desc" },
    include: { fotos: { select: { isFavorit: true } } },
  });
  const pakets = await prisma.paket.findMany();
  const fotografer = await prisma.fotografer.findMany();
  const ruangan = await prisma.ruangan.findMany();
  const namaPaket = Object.fromEntries(pakets.map((p) => [p.id, p.nama]));
  const namaFg = Object.fromEntries(fotografer.map((f) => [f.id, f.nama]));
  const namaRg = Object.fromEntries(ruangan.map((r) => [r.id, r.nama]));

  const terjadwal = daftar.filter((b) => b.status === "terjadwal").length;
  const belumLunas = daftar.filter((b) => b.statusBayar === "belum_lunas" && b.status !== "batal").length;

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Dashboard Studio</h1>
        <p className="mt-1 text-sm text-slate-500">
          {daftar.length} booking · {terjadwal} terjadwal ·{" "}
          <span className="font-semibold text-amber-700">{belumLunas} belum lunas</span>
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/booking/baru" className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Buat Booking Baru
          </Link>
          <Link href="/master" className="rounded border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Master Data
          </Link>
        </div>
      </div>

      {daftar.length === 0 ? (
        <div className="rounded bg-white p-10 text-center text-slate-500 shadow-sm">
          Belum ada booking. Mulai dengan membuat booking baru.
        </div>
      ) : (
        <div className="overflow-x-auto rounded bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-600">
                <th className="px-4 py-3">Klien</th>
                <th className="px-4 py-3">Jadwal</th>
                <th className="px-4 py-3">Paket / Tim</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bayar</th>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((b) => {
                const fav = b.fotos.filter((f) => f.isFavorit).length;
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{b.klienNama}</div>
                      <div className="text-xs text-slate-500">{b.klienWa}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatTanggal(b.tanggal)}</div>
                      <div className="text-xs text-slate-500">{b.jamMulai} - {b.jamSelesai}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{namaPaket[b.paketId] ?? "-"}</div>
                      <div className="text-xs text-slate-500">
                        {namaFg[b.fotograferId] ?? "-"} · {namaRg[b.ruanganId] ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{rupiah(b.totalHarga)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${b.status === "batal" ? "bg-red-100 text-red-800" : b.status === "selesai" ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-800"}`}>
                        {statusLabel[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${b.statusBayar === "lunas" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {statusLabel[b.statusBayar] ?? b.statusBayar}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.fotos.length} foto · {fav} favorit
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/booking/${b.id}`} className="text-indigo-700 hover:underline">
                          Detail
                        </Link>
                        {b.statusBayar !== "lunas" && b.status !== "batal" && (
                          <BayarButton id={b.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
