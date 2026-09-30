import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AddonSnapshot,
  buatPasswordGaleri,
  isJam,
  isTanggal,
  jamOverlap,
  parseAddons,
  tambahMenit,
} from "@/lib/booking";
import { nowIso } from "@/lib/format";

export async function GET() {
  const daftar = await prisma.booking.findMany({
    orderBy: { id: "desc" },
    include: {
      fotos: { select: { id: true, isFavorit: true } },
    },
  });
  return NextResponse.json(
    daftar.map((b) => ({
      ...b,
      jumlahFoto: b.fotos.length,
      jumlahFavorit: b.fotos.filter((f) => f.isFavorit).length,
      fotos: undefined,
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });

  const { paket_id, fotografer_id, ruangan_id, tanggal, jam_mulai, klien_nama, klien_wa } = body;
  const addonsInput = body.addons;

  if (!paket_id || !fotografer_id || !ruangan_id || !tanggal || !jam_mulai || !klien_nama || !klien_wa) {
    return NextResponse.json(
      { error: "paket_id, fotografer_id, ruangan_id, tanggal, jam_mulai, klien_nama, klien_wa wajib diisi" },
      { status: 400 }
    );
  }
  if (!isTanggal(tanggal)) return NextResponse.json({ error: "tanggal harus format YYYY-MM-DD" }, { status: 400 });
  if (!isJam(jam_mulai)) return NextResponse.json({ error: "jam_mulai harus format HH:MM" }, { status: 400 });

  const paket = await prisma.paket.findUnique({ where: { id: Number(paket_id) } });
  if (!paket) return NextResponse.json({ error: "paket tidak ditemukan" }, { status: 404 });
  const fotografer = await prisma.fotografer.findUnique({ where: { id: Number(fotografer_id) } });
  if (!fotografer) return NextResponse.json({ error: "fotografer tidak ditemukan" }, { status: 404 });
  const ruangan = await prisma.ruangan.findUnique({ where: { id: Number(ruangan_id) } });
  if (!ruangan) return NextResponse.json({ error: "ruangan tidak ditemukan" }, { status: 404 });

  const addonIds: number[] = Array.isArray(addonsInput) ? addonsInput.map(Number) : [];
  const snapshot: AddonSnapshot[] = [];
  for (const aid of addonIds) {
    const a = await prisma.addon.findUnique({ where: { id: aid } });
    if (!a) return NextResponse.json({ error: `addon id ${aid} tidak ditemukan` }, { status: 404 });
    snapshot.push({ id: a.id, nama: a.nama, harga: a.harga });
  }

  const jamMulai = jam_mulai as string;
  const jamSelesai = tambahMenit(jamMulai, paket.durasiMenit);
  const totalHarga = paket.harga + snapshot.reduce((s, a) => s + a.harga, 0);

  // Validasi bentrok keras: fotografer ATAU ruangan overlap jam di tanggal sama
  const kandidat = await prisma.booking.findMany({
    where: {
      tanggal: tanggal as string,
      status: { not: "batal" },
      OR: [{ fotograferId: Number(fotografer_id) }, { ruanganId: Number(ruangan_id) }],
    },
  });
  const bentrokFotografer: { id: number; jam: string; klien: string }[] = [];
  const bentrokRuangan: { id: number; jam: string; klien: string }[] = [];
  for (const k of kandidat) {
    if (!jamOverlap(jamMulai, jamSelesai, k.jamMulai, k.jamSelesai)) continue;
    const info = { id: k.id, jam: `${k.jamMulai}-${k.jamSelesai}`, klien: k.klienNama };
    if (k.fotograferId === Number(fotografer_id)) bentrokFotografer.push(info);
    if (k.ruanganId === Number(ruangan_id)) bentrokRuangan.push(info);
  }
  if (bentrokFotografer.length > 0 || bentrokRuangan.length > 0) {
    const sebab: string[] = [];
    if (bentrokFotografer.length > 0) sebab.push(`fotografer ${fotografer.nama} bentrok`);
    if (bentrokRuangan.length > 0) sebab.push(`ruangan ${ruangan.nama} bentrok`);
    return NextResponse.json(
      {
        error: `Jadwal bentrok: ${sebab.join(" dan ")} pada ${tanggal}`,
        penyebab: { fotografer: bentrokFotografer, ruangan: bentrokRuangan },
      },
      { status: 409 }
    );
  }

  const created = await prisma.booking.create({
    data: {
      paketId: Number(paket_id),
      fotograferId: Number(fotografer_id),
      ruanganId: Number(ruangan_id),
      klienNama: String(klien_nama),
      klienWa: String(klien_wa),
      tanggal: tanggal as string,
      jamMulai,
      jamSelesai,
      addons: JSON.stringify(snapshot),
      totalHarga,
      galleryPassword: buatPasswordGaleri(),
      createdAt: nowIso(),
    },
  });

  return NextResponse.json(
    {
      ...created,
      addons_detail: snapshot,
      galeri_url: `/galeri/${created.id}`,
    },
    { status: 201 }
  );
}
