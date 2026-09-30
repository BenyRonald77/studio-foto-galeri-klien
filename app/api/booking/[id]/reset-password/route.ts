import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buatPasswordGaleri } from "@/lib/booking";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  const passwordBaru = buatPasswordGaleri();
  await prisma.booking.update({
    where: { id },
    data: { galleryPassword: passwordBaru, galleryToken: null },
  });
  return NextResponse.json({ gallery_password: passwordBaru });
}
