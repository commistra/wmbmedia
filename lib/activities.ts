import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "./firebaseAdmin";

export type Activity = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">;

const COL = "activities";

export async function listActivities({
  includeUnpublished = false,
}: {
  includeUnpublished?: boolean;
} = {}): Promise<Activity[]> {
  const db = getFirebaseAdmin();
  const snap = await db.collection(COL).orderBy("createdAt", "desc").get();
  const activities = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Activity, "id">),
  }));

  if (includeUnpublished) return activities;
  return activities.filter((a) => a.published);
}

export async function getActivity(id: string): Promise<Activity | null> {
  const db = getFirebaseAdmin();
  const doc = await db.collection(COL).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<Activity, "id">) };
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc();
  const payload = {
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload);
  const created = await ref.get();
  return { id: created.id, ...(created.data() as Omit<Activity, "id">) };
}

export async function updateActivity(
  id: string,
  input: Partial<ActivityInput>
): Promise<Activity | null> {
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc(id);
  await ref.set(
    { ...input, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  const updated = await ref.get();
  if (!updated.exists) return null;
  return { id: updated.id, ...(updated.data() as Omit<Activity, "id">) };
}

export async function deleteActivity(id: string): Promise<boolean> {
  const db = getFirebaseAdmin();
  const ref = db.collection(COL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}
