export const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

export const formatTanggal = (yyyyMmDd: string) => {
  const [y, m, d] = yyyyMmDd.split("-");
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${d} ${bulan[Number(m) - 1] ?? ""} ${y}`;
};

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const nowIso = () => new Date().toISOString();

export const statusLabel: Record<string, string> = {
  terjadwal: "Terjadwal",
  selesai: "Selesai",
  batal: "Batal",
  belum_lunas: "Belum Lunas",
  lunas: "Lunas",
};
