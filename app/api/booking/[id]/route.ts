import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAddons } from "@/lib/booking";

const STATUS_VALID = ["terjadwal", "selesai", "batal"];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const b = await prisma.booking.findUnique({
    where: { id: Number(params.id) },
    include: {
      fotos: { orderBy: { id: "asc" } },
    },
  });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  return NextResponse.json({
    ...b,
    addons_detail: parseAddons(b.addons),
    jumlahFoto: b.fotos.length,
    jumlahFavorit: b.fotos.filter((f) => f.isFavorit).length,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  if (!body || !STATUS_VALID.includes(String(body.status))) {
    return NextResponse.json(
      { error: `status harus salah satu dari: ${STATUS_VALID.join(", ")}` },
      { status: 400 }
    );
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: String(body.status) },
  });
  return NextResponse.json(updated);
}
