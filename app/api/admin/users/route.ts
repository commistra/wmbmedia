import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { isSuperAdminEmail } from "../../../../lib/admin";
import { createAdminUser, listUsers } from "../../../../lib/users";

function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Unexpected error";
}

function isClientErrorMessage(message: string) {
  return (
    message === "Invalid input" ||
    message === "Password too short" ||
    message === "Email already exists" ||
    message === "Username already exists"
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdminEmail(email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await listUsers();
  const safe = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
  return NextResponse.json({ users: safe });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdminEmail(email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as Partial<{
    name: string;
    email: string;
    username: string;
    password: string;
  }>;

  if (!body.name || !body.email || !body.username || !body.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const created = await createAdminUser({
      name: body.name,
      email: body.email,
      username: body.username,
      password: body.password,
      role: "admin",
    });
    return NextResponse.json(
      {
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          username: created.username,
          role: created.role,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    const message = toErrorMessage(e);
    console.error("POST /api/admin/users failed:", e);

    const status = isClientErrorMessage(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
