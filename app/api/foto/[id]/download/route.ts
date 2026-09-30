import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readUploadFile } from "@/lib/storage";
import { sesiGaleriValid, tipeKonten } from "@/lib/galeri";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const foto = await prisma.foto.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!foto) return NextResponse.json({ error: "foto tidak ditemukan" }, { status: 404 });
  if (!(await sesiGaleriValid(foto.bookingId))) {
    return NextResponse.json({ error: "masukkan password galeri terlebih dahulu" }, { status: 401 });
  }
  if (foto.booking.statusBayar !== "lunas") {
    return NextResponse.json(
      { error: "unduh kualitas tinggi hanya tersedia setelah pelunasan" },
      { status: 402 }
    );
  }
  let data: Buffer;
  try {
    data = await readUploadFile(foto.path);
  } catch {
    return NextResponse.json({ error: "file tidak ditemukan di storage" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": tipeKonten(foto.filename),
      "Content-Disposition": `attachment; filename="${foto.filename.replace(/"/g, "")}"`,
    },
  });
}
