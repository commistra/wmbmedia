import { NextResponse } from "next/server";
import { listUmkms } from "../../../lib/umkm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;
  const safeLimit =
    typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.min(50, limit) : undefined;

  const umkms = await listUmkms({ limit: safeLimit });
  return NextResponse.json({ umkms });
}

