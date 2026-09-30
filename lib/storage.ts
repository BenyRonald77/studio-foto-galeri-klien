import fs from "fs/promises";
import path from "path";
import { buatToken } from "./booking";

/**
 * Lapisan storage file. Saat ini menyimpan ke disk lokal di luar folder public
 * agar file asli tidak bisa diakses publik tanpa sesi galeri.
 *
 * Untuk pindah ke S3 (atau object storage lain), cukup ganti dua fungsi di file
 * ini (saveUploadFile dan readUploadFile) dengan implementasi S3; seluruh kode
 * lain (API upload, file, download) tidak perlu diubah.
 */

const STORAGE_ROOT =
  process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage");

function namaAman(nama: string): string {
  return nama.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

/** Simpan buffer upload, kembalikan path relatif (mis. "booking-3/ab12-foto.jpg"). */
export async function saveUploadFile(
  bookingId: number,
  filename: string,
  data: Buffer
): Promise<string> {
  const dir = path.join(STORAGE_ROOT, `booking-${bookingId}`);
  await fs.mkdir(dir, { recursive: true });
  const rel = `booking-${bookingId}/${buatToken(8)}-${namaAman(filename)}`;
  await fs.writeFile(path.join(STORAGE_ROOT, rel), data);
  return rel;
}

/** Baca file dari storage lokal. */
export async function readUploadFile(relPath: string): Promise<Buffer> {
  const full = path.join(STORAGE_ROOT, relPath);
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(STORAGE_ROOT))) {
    throw new Error("path tidak valid");
  }
  return fs.readFile(resolved);
}
