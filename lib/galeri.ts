import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const namaCookieGaleri = (bookingId: number) => `galeri_${bookingId}`;

/** Tebak Content-Type dari ekstensi nama file. */
export function tipeKonten(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
  const TIPE: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
  };
  return TIPE[ext] ?? "application/octet-stream";
}

/** Cek cookie sesi galeri cocok dengan token yang tersimpan di booking. */
export async function sesiGaleriValid(bookingId: number): Promise<boolean> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || !booking.galleryToken) return false;
  const c = cookies().get(namaCookieGaleri(bookingId));
  return !!c && c.value === booking.galleryToken;
}
