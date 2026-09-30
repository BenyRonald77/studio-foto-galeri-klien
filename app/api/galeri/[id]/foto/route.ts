import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sesiGaleriValid } from "@/lib/galeri";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  if (!(await sesiGaleriValid(id))) {
    return NextResponse.json({ error: "masukkan password galeri terlebih dahulu" }, { status: 401 });
  }
  const fotos = await prisma.foto.findMany({
    where: { bookingId: id },
    orderBy: { id: "asc" },
    select: { id: true, filename: true, ukuranKb: true, isFavorit: true, uploadedAt: true },
  });
  return NextResponse.json({
    booking: {
      id: b.id,
      klienNama: b.klienNama,
      tanggal: b.tanggal,
      statusBayar: b.statusBayar,
    },
    fotos,
  });
}
