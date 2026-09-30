import { randomBytes } from "crypto";

/** Tambah menit ke jam "HH:MM", hasil "HH:MM" (boleh lewat tengah malam). */
export function tambahMenit(jam: string, menit: number): string {
  const [h, m] = jam.split(":").map(Number);
  const total = h * 60 + m + menit;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Cek dua rentang jam [mulai, selesai) saling overlap. */
export function jamOverlap(aMulai: string, aSelesai: string, bMulai: string, bSelesai: string): boolean {
  return aMulai < bSelesai && aSelesai > bMulai;
}

export const isTanggal = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const isJam = (s: unknown): s is string =>
  typeof s === "string" && /^\d{2}:\d{2}$/.test(s);

export interface AddonSnapshot {
  id: number;
  nama: string;
  harga: number;
}

export function parseAddons(json: string): AddonSnapshot[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Password galeri: 8 karakter alfanumerik tanpa karakter ambigu. */
export function buatPasswordGaleri(): string {
  const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (const b of bytes) out += alfabet[b % alfabet.length];
  return out;
}

/** Token acak heksadesimal. */
export function buatToken(nBytes = 24): string {
  return randomBytes(nBytes).toString("hex");
}
