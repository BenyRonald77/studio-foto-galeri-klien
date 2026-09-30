import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buatToken } from "@/lib/booking";
import { namaCookieGaleri } from "@/lib/galeri";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password !== b.galleryPassword) {
    return NextResponse.json({ error: "password galeri salah" }, { status: 401 });
  }

  const token = buatToken(16);
  await prisma.booking.update({ where: { id }, data: { galleryToken: token } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(namaCookieGaleri(id), token, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 3600,
    sameSite: "lax",
  });
  return res;
}
