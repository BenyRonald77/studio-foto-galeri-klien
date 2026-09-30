# Studio Foto: Galeri Klien Privat

Aplikasi manajemen studio foto: booking sesi dengan validasi bentrok fotografer/ruangan,
upload hasil via pola presigned-URL, galeri privat berpassword per klien, penanda favorit,
dan unduh file kualitas tinggi hanya setelah pelunasan.

## Cara Menjalankan

```
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000 (dashboard admin) dan http://localhost:3000/galeri/1 (galeri klien,
password contoh: `galeri123` dari seed).

## Halaman

- `/` — Dashboard admin: daftar booking, status bayar, tombol tandai lunas, jumlah foto dan favorit per booking.
- `/booking/baru` — Form booking sesi (hitung jam selesai otomatis dari durasi paket, validasi bentrok).
- `/booking/[id]` — Detail booking: data sesi, password galeri + reset, panel upload hasil, batalkan booking.
- `/master` — CRUD paket, addon, fotografer, ruangan.
- `/galeri/[booking_id]` — Galeri privat klien: minta password, grid foto, tandai favorit, unduh HD (setelah lunas).

## Pola Presigned-URL (Upload)

Upload hasil memakai pola presigned-URL dua langkah, seperti S3 presigned URL tetapi
dengan storage lokal:

1. Admin: `POST /api/booking/[id]/upload-url` dengan `{filename, ukuran_kb}` →
   menerima `{upload_url: "/api/upload/<token>", token, expires_at}`.
   Token acak, sekali pakai, kedaluwarsa 15 menit, tersimpan di tabel `UploadToken`.
2. Admin: `PUT /api/upload/<token>` dengan body binary file →
   file disimpan, record `Foto` dibuat, token ditandai terpakai.

File disimpan di folder `storage/` (di luar `public/`), sehingga file asli tidak bisa
diakses publik tanpa sesi galeri. Untuk pindah ke S3 (atau object storage lain), cukup
ganti dua fungsi di `lib/storage.ts` (`saveUploadFile` dan `readUploadFile`); seluruh
kode lain tidak perlu diubah.

## API

- `GET/POST /api/paket`, `GET/PUT/DELETE /api/paket/[id]`
- `GET/POST /api/addon`, `GET/PUT/DELETE /api/addon/[id]`
- `GET/POST /api/fotografer`, `GET/PUT/DELETE /api/fotografer/[id]`
- `GET/POST /api/ruangan`, `GET/PUT/DELETE /api/ruangan/[id]`
- `GET/POST /api/booking` — buat booking; 409 jika fotografer atau ruangan bentrok
- `GET/PATCH /api/booking/[id]` — PATCH `{status}` untuk batal/selesai
- `PATCH /api/booking/[id]/bayar` — tandai lunas
- `POST /api/booking/[id]/upload-url` — minta token upload
- `POST /api/booking/[id]/reset-password` — password galeri baru
- `PUT /api/upload/[token]` — upload binary file
- `POST /api/galeri/[id]/auth` — login galeri dengan password (set cookie sesi)
- `GET /api/galeri/[id]/foto` — daftar foto (butuh sesi; 401 tanpa sesi)
- `POST /api/foto/[id]/favorit` — toggle favorit (butuh sesi)
- `GET /api/foto/[id]/file` — tampilkan foto (butuh sesi; 401 tanpa sesi)
- `GET /api/foto/[id]/download` — unduh file asli; 401 tanpa sesi, 402 jika belum lunas

## Seed

3 paket, 3 addon, 2 fotografer, 2 ruangan, dan 1 booking contoh (password galeri: `galeri123`).
