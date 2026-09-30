import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buatToken } from "@/lib/booking";

const EXPIRY_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  if (b.status === "batal") {
    return NextResponse.json({ error: "booking sudah dibatalkan, tidak bisa upload" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { filename?: unknown; ukuran_kb?: unknown } | null;
  const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
  const ukuranKb = Number(body?.ukuran_kb);
  if (!filename) return NextResponse.json({ error: "filename wajib diisi" }, { status: 400 });
  if (!Number.isFinite(ukuranKb) || ukuranKb <= 0) {
    return NextResponse.json({ error: "ukuran_kb harus angka > 0" }, { status: 400 });
  }

  const token = buatToken(16);
  const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();
  await prisma.uploadToken.create({
    data: { token, bookingId: id, filename, ukuranKb: Math.round(ukuranKb), expiresAt },
  });

  return NextResponse.json(
    { upload_url: `/api/upload/${token}`, token, expires_at: expiresAt },
    { status: 201 }
  );
}
