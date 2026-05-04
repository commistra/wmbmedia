import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "./firebaseAdmin";
import { hashPassword } from "./password";

export type UserRole = "admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  passwordHash?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreateAdminUserInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: UserRole;
};

const COL = "users";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const db = getFirebaseAdmin();
  const snap = await db
    .collection(COL)
    .where("emailLower", "==", normalizeEmail(email))
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return { id: doc.id, ...(doc.data() as Omit<AdminUser, "id">) };
}

export async function getUserByIdentifier(
  identifier: string
): Promise<AdminUser | null> {
  const db = getFirebaseAdmin();
  const value = identifier.trim().toLowerCase();

  const byEmail = await db
    .collection(COL)
    .where("emailLower", "==", value)
    .limit(1)
    .get();
  if (byEmail.docs[0]) {
    const doc = byEmail.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<AdminUser, "id">) };
  }

  const byUsername = await db
    .collection(COL)
    .where("usernameLower", "==", value)
    .limit(1)
    .get();
  const doc = byUsername.docs[0];
  if (!doc) return null;
  return { id: doc.id, ...(doc.data() as Omit<AdminUser, "id">) };
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const db = getFirebaseAdmin();

  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);
  const name = input.name.trim();
  if (!email || !username || !name) throw new Error("Invalid input");
  if (input.password.length < 8) throw new Error("Password too short");

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) throw new Error("Email already exists");

  const existingIdentifier = await getUserByIdentifier(username);
  if (existingIdentifier) throw new Error("Username already exists");

  const ref = db.collection(COL).doc();
  const payload: Omit<AdminUser, "id"> & {
    emailLower: string;
    usernameLower: string;
  } = {
    name,
    email,
    username,
    role: input.role ?? "admin",
    passwordHash: hashPassword(input.password),
    emailLower: email,
    usernameLower: username,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload);
  const created = await ref.get();
  return { id: created.id, ...(created.data() as Omit<AdminUser, "id">) };
}

export async function setUserPasswordByEmail(email: string, newPassword: string) {
  const db = getFirebaseAdmin();
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found");
  if (newPassword.length < 8) throw new Error("Password too short");
  await db
    .collection(COL)
    .doc(user.id)
    .set(
      {
        passwordHash: hashPassword(newPassword),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function listUsers(): Promise<AdminUser[]> {
  const db = getFirebaseAdmin();
  const snap = await db.collection(COL).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, "id">) }));
}

