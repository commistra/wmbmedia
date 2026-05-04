import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { isSuperAdminEmail } from "../../../../../lib/admin";
import { createAdminUser, getUserByEmail, setUserPasswordByEmail } from "../../../../../lib/users";
import { verifyPassword } from "../../../../../lib/password";

function emailToBaseUsername(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "admin";
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const emailRaw = session?.user?.email ?? null;
  if (!emailRaw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = emailRaw.toLowerCase();

  const body = (await request.json()) as Partial<{
    currentPassword: string;
    newPassword: string;
  }>;
  const newPassword = body.newPassword ?? "";
  if (!newPassword) return NextResponse.json({ error: "Missing newPassword" }, { status: 400 });

  const existing = await getUserByEmail(email);
  if (existing?.passwordHash) {
    const currentPassword = body.currentPassword ?? "";
    if (!currentPassword)
      return NextResponse.json({ error: "Missing currentPassword" }, { status: 400 });
    if (!verifyPassword(currentPassword, existing.passwordHash)) {
      return NextResponse.json({ error: "Invalid currentPassword" }, { status: 400 });
    }
    await setUserPasswordByEmail(email, newPassword);
    return NextResponse.json({ ok: true });
  }

  if (!existing && isSuperAdminEmail(email)) {
    const base = emailToBaseUsername(email);
    try {
      await createAdminUser({
        name: base,
        email,
        username: base,
        password: newPassword,
        role: "admin",
      });
      return NextResponse.json({ ok: true });
    } catch {
      // fallthrough; e.g. username collision
    }
  }

  if (!existing) {
    return NextResponse.json(
      { error: "User record not found. Ask superadmin to register you." },
      { status: 400 }
    );
  }

  await setUserPasswordByEmail(email, newPassword);
  return NextResponse.json({ ok: true });
}

