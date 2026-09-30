import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  const updated = await prisma.booking.update({
    where: { id },
    data: { statusBayar: "lunas" },
  });
  return NextResponse.json(updated);
}
