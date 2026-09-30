import { NextRequest } from "next/server";
import { createMaster, listMaster } from "@/lib/master";

export async function GET() {
  return listMaster("addon");
}

export async function POST(req: NextRequest) {
  return createMaster("addon", await req.json().catch(() => null));
}
