# PRD — Studio Foto: Galeri Klien Privat

## Ringkasan
Aplikasi manajemen studio foto: master data paket/addon/fotografer/ruangan, booking sesi
dengan validasi bentrok keras, upload hasil via pola presigned-URL, galeri privat per klien
berpassword, penanda favorit, dan unduh file asli hanya setelah pelunasan.

## Stack
Next.js 14 + TypeScript + Prisma 5.22 + SQLite + Tailwind CSS.

## Model Data
- **Paket**: nama, harga (Rp), durasi_menit, deskripsi
- **Addon**: nama, harga (Rp)
- **Fotografer**: nama, no_hp
- **Ruangan**: nama, kapasitas
- **Booking**: paket_id, fotografer_id, ruangan_id, klien_nama, klien_wa, tanggal
  (TEXT YYYY-MM-DD), jam_mulai/jam_selesai (TEXT HH:MM), addons (JSON snapshot
  [{id,nama,harga}] untuk mengunci harga), total_harga, status
  (terjadwal/selesai/batal), status_bayar (belum_lunas/lunas), gallery_password,
  gallery_token (sesi galeri, nullable), created_at (ISO TEXT)
- **Foto**: booking_id, filename, path (path storage relatif), ukuran_kb, is_favorit,
  uploaded_at (ISO TEXT)
- **UploadToken**: token (unik), booking_id, filename, ukuran_kb, expires_at (ISO TEXT),
  used_at (ISO TEXT, nullable)

## Fungsionalitas
- **F0 — Setup**: schema Prisma, seed (3 paket, 3 addon, 2 fotografer, 2 ruangan,
  1 booking contoh), layout + navigasi, dashboard admin.
- **F1 — Master data**: CRUD paket, addon, fotografer, ruangan (halaman + API).
- **F2 — Booking sesi**: `POST /api/booking` menerima paket_id, fotografer_id,
  ruangan_id, tanggal, jam_mulai, klien_nama, klien_wa, addons[].
  jam_selesai = jam_mulai + durasi paket; total = harga paket + harga addons (snapshot).
  Password galeri dibuat otomatis. Validasi bentrok KERAS: fotografer ATAU ruangan yang
  overlap jam pada tanggal yang sama (status selain batal) → 409 dengan penjelasan
  penyebab (fotografer/ruangan + booking yang bentrok). `PATCH /api/booking/[id]`
  dengan {status:"batal"} membatalkan.
- **F3 — Upload presigned-URL**: `POST /api/booking/[id]/upload-url` {filename, ukuran_kb}
  → {upload_url: "/api/upload/<token>", token}. Token sekali pakai, kedaluwarsa 15 menit,
  disimpan di UploadToken. `PUT /api/upload/<token>` dengan body binary → file disimpan
  di storage lokal, record Foto dibuat. Halaman admin upload per booking.
- **F4 — Galeri privat**: `/galeri/[booking_id]` meminta password → sesi sederhana
  (cookie httpOnly berisi token sesi). Grid foto tampil setelah sesi valid.
  `POST /api/foto/[id]/favorit` toggle favorit (butuh sesi galeri).
  File asli hanya bisa diakses lewat endpoint berproteksi sesi, tidak ada di folder public.
- **F5 — Pelunasan & unduh**: `PATCH /api/booking/[id]/bayar` → status_bayar lunas.
  `GET /api/foto/[id]/download` → file asli hanya jika sesi galeri valid DAN booking
  lunas; 401 tanpa sesi, 402 jika belum lunas. Dashboard menampilkan tombol unduh
  kualitas tinggi di galeri hanya setelah lunas, dan daftar booking + tombol tandai lunas.

## Aturan Bisnis
- Bentrok dihitung per tanggal; booking berstatus batal diabaikan.
- Overlap: (jam_mulai_baru < jam_selesai_lama) DAN (jam_selesai_baru > jam_mulai_lama).
- Harga addons di-snapshot saat booking agar perubahan master tidak mengubah histori.
- Token upload sekali pakai: setelah PUT berhasil, used_at diisi; token kedaluwarsa
  atau sudah dipakai → 404/410.
- Password galeri bisa di-reset admin; reset membuat token sesi lama tidak valid.

## Endpoint Ringkas
- `GET/POST /api/paket`, `PUT/DELETE /api/paket/[id]`
- `GET/POST /api/addon`, `PUT/DELETE /api/addon/[id]`
- `GET/POST /api/fotografer`, `PUT/DELETE /api/fotografer/[id]`
- `GET/POST /api/ruangan`, `PUT/DELETE /api/ruangan/[id]`
- `GET/POST /api/booking`, `GET/PATCH /api/booking/[id]`,
  `PATCH /api/booking/[id]/bayar`, `POST /api/booking/[id]/upload-url`,
  `POST /api/booking/[id]/reset-password`
- `PUT /api/upload/[token]`
- `POST /api/galeri/[id]/auth`, `GET /api/galeri/[id]/foto`
- `POST /api/foto/[id]/favorit`, `GET /api/foto/[id]/file`, `GET /api/foto/[id]/download`
