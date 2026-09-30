import { NextRequest } from "next/server";
import { createMaster, listMaster } from "@/lib/master";

export async function GET() {
  return listMaster("ruangan");
}

export async function POST(req: NextRequest) {
  return createMaster("ruangan", await req.json().catch(() => null));
}
