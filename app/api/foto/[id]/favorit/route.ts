import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sesiGaleriValid } from "@/lib/galeri";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const foto = await prisma.foto.findUnique({ where: { id } });
  if (!foto) return NextResponse.json({ error: "foto tidak ditemukan" }, { status: 404 });
  if (!(await sesiGaleriValid(foto.bookingId))) {
    return NextResponse.json({ error: "masukkan password galeri terlebih dahulu" }, { status: 401 });
  }
  const updated = await prisma.foto.update({
    where: { id },
    data: { isFavorit: !foto.isFavorit },
  });
  return NextResponse.json({ id: updated.id, is_favorit: updated.isFavorit });
}
