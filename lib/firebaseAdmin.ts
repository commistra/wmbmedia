import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

function loadServiceAccount(): Record<string, unknown> {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) return JSON.parse(json) as Record<string, unknown>;

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    path.join(process.cwd(), "secret", "firebase-service-account.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing Firebase service account JSON. Set FIREBASE_SERVICE_ACCOUNT_PATH or create ${filePath}`
    );
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

export function getFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(loadServiceAccount() as never),
    });
  }
  return getFirestore();
}
