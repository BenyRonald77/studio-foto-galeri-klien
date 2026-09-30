import { PrismaClient } from "@prisma/client";
import { buatPasswordGaleri } from "../lib/booking";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.paket.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  await prisma.paket.createMany({
    data: [
      { nama: "Basic", harga: 500000, durasiMenit: 90, deskripsi: "Sesi 1,5 jam, 15 foto edit, 1 lokasi dalam studio" },
      { nama: "Standard", harga: 1250000, durasiMenit: 150, deskripsi: "Sesi 2,5 jam, 30 foto edit, 2 lokasi, 1 kostum ganti" },
      { nama: "Premium", harga: 3500000, durasiMenit: 300, deskripsi: "Sesi 5 jam, 80 foto edit, semua ruangan, cetak 10R x5" },
    ],
  });
  await prisma.addon.createMany({
    data: [
      { nama: "Cetak 10R", harga: 50000 },
      { nama: "Album Eksklusif", harga: 350000 },
      { nama: "Tambah 30 Menit", harga: 200000 },
    ],
  });
  await prisma.fotografer.createMany({
    data: [
      { nama: "Andi Pratama", noHp: "081234567890" },
      { nama: "Sari Dewi", noHp: "081298765432" },
    ],
  });
  await prisma.ruangan.createMany({
    data: [
      { nama: "Studio A", kapasitas: 10 },
      { nama: "Studio B", kapasitas: 6 },
    ],
  });

  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const tgl = `${besok.getFullYear()}-${String(besok.getMonth() + 1).padStart(2, "0")}-${String(besok.getDate()).padStart(2, "0")}`;
  await prisma.booking.create({
    data: {
      paketId: 2,
      fotograferId: 1,
      ruanganId: 1,
      klienNama: "Budi Santoso",
      klienWa: "081111222333",
      tanggal: tgl,
      jamMulai: "10:00",
      jamSelesai: "12:30",
      addons: JSON.stringify([{ id: 1, nama: "Cetak 10R", harga: 50000 }]),
      totalHarga: 1300000,
      galleryPassword: "galeri123",
      createdAt: new Date().toISOString(),
    },
  });

  console.log("seed selesai");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
