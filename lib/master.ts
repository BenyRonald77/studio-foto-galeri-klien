import { NextResponse } from "next/server";
import { prisma } from "./prisma";

type ModelKey = "paket" | "addon" | "fotografer" | "ruangan";

const required: Record<ModelKey, string[]> = {
  paket: ["nama", "harga", "durasiMenit"],
  addon: ["nama", "harga"],
  fotografer: ["nama", "noHp"],
  ruangan: ["nama", "kapasitas"],
};

const numeric: Record<ModelKey, string[]> = {
  paket: ["harga", "durasiMenit"],
  addon: ["harga"],
  fotografer: [],
  ruangan: ["kapasitas"],
};

const label: Record<ModelKey, string> = {
  paket: "Paket",
  addon: "Addon",
  fotografer: "Fotografer",
  ruangan: "Ruangan",
};

function model(m: ModelKey) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[m] as {
    findMany: (a: unknown) => Promise<unknown[]>;
    findUnique: (a: unknown) => Promise<unknown | null>;
    create: (a: unknown) => Promise<unknown>;
    update: (a: unknown) => Promise<unknown>;
    delete: (a: unknown) => Promise<unknown>;
    count: (a: unknown) => Promise<number>;
  };
}

function validasi(m: ModelKey, body: Record<string, unknown>): string | null {
  for (const f of required[m]) {
    const v = body[f];
    if (v === undefined || v === null || v === "") return `${f} wajib diisi`;
  }
  for (const f of numeric[m]) {
    const v = Number(body[f]);
    if (!Number.isFinite(v) || v < 0) return `${f} harus angka >= 0`;
    if (f !== "harga" && v <= 0) return `${f} harus angka > 0`;
  }
  return null;
}

function normalisasi(m: ModelKey, body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of [...required[m], "deskripsi"]) {
    if (body[f] === undefined) continue;
    out[f] = numeric[m].includes(f) ? Number(body[f]) : body[f];
  }
  return out;
}

export async function listMaster(m: ModelKey) {
  const rows = await model(m).findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(rows);
}

export async function createMaster(m: ModelKey, body: unknown) {
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  }
  const err = validasi(m, body as Record<string, unknown>);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const created = await model(m).create({ data: normalisasi(m, body as Record<string, unknown>) });
  return NextResponse.json(created, { status: 201 });
}

export async function getMaster(m: ModelKey, id: number) {
  const row = await model(m).findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: `${label[m]} tidak ditemukan` }, { status: 404 });
  return NextResponse.json(row);
}

export async function updateMaster(m: ModelKey, id: number, body: unknown) {
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  }
  const ada = await model(m).findUnique({ where: { id } });
  if (!ada) return NextResponse.json({ error: `${label[m]} tidak ditemukan` }, { status: 404 });
  const err = validasi(m, body as Record<string, unknown>);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const updated = await model(m).update({ where: { id }, data: normalisasi(m, body as Record<string, unknown>) });
  return NextResponse.json(updated);
}

export async function deleteMaster(m: ModelKey, id: number) {
  const ada = await model(m).findUnique({ where: { id } });
  if (!ada) return NextResponse.json({ error: `${label[m]} tidak ditemukan` }, { status: 404 });
  if (m === "paket" || m === "fotografer" || m === "ruangan") {
    const field = m === "paket" ? "paketId" : m === "fotografer" ? "fotograferId" : "ruanganId";
    const dipakai = await prisma.booking.count({ where: { [field]: id, status: { not: "batal" } } });
    if (dipakai > 0) {
      return NextResponse.json(
        { error: `${label[m]} masih dipakai ${dipakai} booking aktif` },
        { status: 409 }
      );
    }
  }
  await model(m).delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
