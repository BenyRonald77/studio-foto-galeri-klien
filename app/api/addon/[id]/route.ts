import { NextRequest } from "next/server";
import { deleteMaster, getMaster, updateMaster } from "@/lib/master";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return getMaster("addon", Number(params.id));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return updateMaster("addon", Number(params.id), await req.json().catch(() => null));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return deleteMaster("addon", Number(params.id));
}
