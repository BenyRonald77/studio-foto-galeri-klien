import { NextRequest } from "next/server";
import { createMaster, listMaster } from "@/lib/master";

export async function GET() {
  return listMaster("paket");
}

export async function POST(req: NextRequest) {
  return createMaster("paket", await req.json().catch(() => null));
}
