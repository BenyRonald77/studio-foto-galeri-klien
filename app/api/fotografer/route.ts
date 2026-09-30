import { NextRequest } from "next/server";
import { createMaster, listMaster } from "@/lib/master";

export async function GET() {
  return listMaster("fotografer");
}

export async function POST(req: NextRequest) {
  return createMaster("fotografer", await req.json().catch(() => null));
}
