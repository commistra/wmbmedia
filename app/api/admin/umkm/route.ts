import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { isAdminEmail } from "../../../../lib/authz";
import { createUmkm, deleteUmkm, listUmkms, updateUmkm, type UmkmInput } from "../../../../lib/umkm";

function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Unexpected error";
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return { ok: false as const, status: 401, error: "Unauthorized" };
  const ok = await isAdminEmail(email);
  if (!ok) return { ok: false as const, status: 403, error: "Forbidden" };
  return { ok: true as const, email };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const umkms = await listUmkms();
  return NextResponse.json({ umkms });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json()) as Partial<UmkmInput>;
  try {
    const created = await createUmkm(body);
    return NextResponse.json({ umkm: created }, { status: 201 });
  } catch (e) {
    const message = toErrorMessage(e);
    const status =
      message.startsWith("Missing ") || message === "Invalid input" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json()) as Partial<UmkmInput> & { id?: string };
  const id = body.id ?? "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const patch = { ...body } as Partial<UmkmInput> & { id?: string };
  delete patch.id;
  const updated = await updateUmkm(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ umkm: updated });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteUmkm(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
