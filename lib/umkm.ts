import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "./firebaseAdmin";

export type Umkm = {
  id: string;
  storeName: string;
  whatsapp: string;
  whatsappE164: string;
  description: string;
  wmbId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UmkmInput = Omit<Umkm, "id" | "createdAt" | "updatedAt" | "whatsappE164"> & {
  whatsappE164?: string;
};

const COL = "umkm";

export function normalizeWhatsAppE164(input: string) {
  const raw = input.trim();
  const digits = raw.replace(/[^\d+]/g, "");
  const noPlus = digits.startsWith("+") ? digits.slice(1) : digits;
  const onlyDigits = noPlus.replace(/\D/g, "");

  if (!onlyDigits) return "";
  if (onlyDigits.startsWith("62")) return onlyDigits;
  if (onlyDigits.startsWith("0")) return `62${onlyDigits.slice(1)}`;
  if (onlyDigits.startsWith("8")) return `62${onlyDigits}`;
  return onlyDigits;
}

function assertValidInput(input: Partial<UmkmInput>): asserts input is UmkmInput {
  if (!input.storeName?.trim()) throw new Error("Missing storeName");
  if (!input.whatsapp?.trim()) throw new Error("Missing whatsapp");
  if (!input.description?.trim()) throw new Error("Missing description");
  if (!input.wmbId?.trim()) throw new Error("Missing wmbId");
}

export async function listUmkms({
  limit,
}: {
  limit?: number;
} = {}): Promise<Umkm[]> {
  const db = getFirebaseAdmin();
  let q = db.collection(COL).orderBy("createdAt", "desc");
  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) q = q.limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Umkm, "id">) }));
}

export async function getUmkm(id: string): Promise<Umkm | null> {
  const db = getFirebaseAdmin();
  const doc = await db.collection(COL).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<Umkm, "id">) };
}

export async function createUmkm(input: Partial<UmkmInput>): Promise<Umkm> {
  assertValidInput(input);
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc();
  const payload = {
    storeName: input.storeName.trim(),
    whatsapp: input.whatsapp.trim(),
    whatsappE164: normalizeWhatsAppE164(input.whatsapp),
    description: input.description.trim(),
    wmbId: input.wmbId.trim(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload);
  const created = await ref.get();
  return { id: created.id, ...(created.data() as Omit<Umkm, "id">) };
}

export async function updateUmkm(id: string, input: Partial<UmkmInput>): Promise<Umkm | null> {
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc(id);

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (typeof input.storeName === "string") patch.storeName = input.storeName.trim();
  if (typeof input.whatsapp === "string") {
    patch.whatsapp = input.whatsapp.trim();
    patch.whatsappE164 = normalizeWhatsAppE164(input.whatsapp);
  }
  if (typeof input.description === "string") patch.description = input.description.trim();
  if (typeof input.wmbId === "string") patch.wmbId = input.wmbId.trim();

  await ref.set(patch, { merge: true });
  const updated = await ref.get();
  if (!updated.exists) return null;
  return { id: updated.id, ...(updated.data() as Omit<Umkm, "id">) };
}

export async function deleteUmkm(id: string): Promise<boolean> {
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}

