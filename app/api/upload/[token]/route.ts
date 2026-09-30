import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadFile } from "@/lib/storage";
import { nowIso } from "@/lib/format";

const MAX_BYTES = 50 * 1024 * 1024;

export async function PUT(req: NextRequest, { params }: { params: { token: string } }) {
  const t = await prisma.uploadToken.findUnique({ where: { token: params.token } });
  if (!t) return NextResponse.json({ error: "token upload tidak valid" }, { status: 404 });
  if (t.usedAt) return NextResponse.json({ error: "token upload sudah dipakai" }, { status: 410 });
  if (new Date(t.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "token upload kedaluwarsa" }, { status: 410 });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0) return NextResponse.json({ error: "body upload kosong" }, { status: 400 });
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "file melebihi batas 50 MB" }, { status: 400 });
  }

  const relPath = await saveUploadFile(t.bookingId, t.filename, buf);
  const foto = await prisma.foto.create({
    data: {
      bookingId: t.bookingId,
      filename: t.filename,
      path: relPath,
      ukuranKb: Math.max(1, Math.round(buf.length / 1024)),
      uploadedAt: nowIso(),
    },
  });
  await prisma.uploadToken.update({ where: { id: t.id }, data: { usedAt: nowIso() } });

  return NextResponse.json(foto, { status: 201 });
}
