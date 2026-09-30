import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTanggal, rupiah, statusLabel } from "@/lib/format";
import { parseAddons } from "@/lib/booking";
import UploadPanel from "./UploadPanel";
import AksiBooking from "./AksiBooking";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const b = await prisma.booking.findUnique({
    where: { id: Number(params.id) },
    include: { fotos: { orderBy: { id: "asc" } } },
  });
  if (!b) notFound();

  const paket = await prisma.paket.findUnique({ where: { id: b.paketId } });
  const fg = await prisma.fotografer.findUnique({ where: { id: b.fotograferId } });
  const rg = await prisma.ruangan.findUnique({ where: { id: b.ruanganId } });
  const addons = parseAddons(b.addons);
  const favorit = b.fotos.filter((f) => f.isFavorit).length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-indigo-700 hover:underline">Kembali ke dashboard</Link>
        <h1 className="mt-1 text-2xl font-bold">Booking #{b.id} · {b.klienNama}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Detail Sesi</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Klien</dt><dd className="font-semibold">{b.klienNama} ({b.klienWa})</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Jadwal</dt><dd className="font-semibold">{formatTanggal(b.tanggal)}, {b.jamMulai}–{b.jamSelesai}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Paket</dt><dd>{paket?.nama ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Fotografer</dt><dd>{fg?.nama ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Ruangan</dt><dd>{rg?.nama ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Addon</dt><dd>{addons.length > 0 ? addons.map((a) => a.nama).join(", ") : "-"}</dd></div>
            <div className="flex justify-between border-t pt-2"><dt className="text-slate-500">Total</dt><dd className="font-bold">{rupiah(b.totalHarga)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd>{statusLabel[b.status] ?? b.status}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Pembayaran</dt><dd>{statusLabel[b.statusBayar] ?? b.statusBayar}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Foto</dt><dd>{b.fotos.length} foto · {favorit} favorit</dd></div>
          </dl>
          <AksiBooking id={b.id} status={b.status} statusBayar={b.statusBayar} />
        </div>

        <div className="rounded bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Galeri Klien</h2>
          <p className="text-sm text-slate-600">Password galeri saat ini:</p>
          <p className="mt-1 inline-block rounded bg-slate-100 px-3 py-2 font-mono text-lg font-bold tracking-widest">
            {b.galleryPassword}
          </p>
          <p className="mt-2 text-sm">
            <Link href={`/galeri/${b.id}`} className="text-indigo-700 hover:underline">
              Buka halaman galeri
            </Link>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Berikan password di atas kepada klien. Reset membuat sesi galeri lama tidak valid.
          </p>
        </div>
      </div>

      <UploadPanel bookingId={b.id} dibatalkan={b.status === "batal"} />

      <div className="rounded bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Daftar Foto ({b.fotos.length})</h2>
        {b.fotos.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada foto diupload.</p>
        ) : (
          <ul className="divide-y text-sm">
            {b.fotos.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2">
                <span>{f.filename} <span className="text-xs text-slate-500">({f.ukuranKb} KB)</span></span>
                {f.isFavorit && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">FAVORIT KLIEN</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
