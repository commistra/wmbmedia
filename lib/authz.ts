import { isSuperAdminEmail } from "./admin";
import { getUserByEmail } from "./users";

const DEFAULT_ADMIN_ALLOWLIST = ["bwfzbw@gmail.com"];

export function getAdminEmailAllowlist() {
  const fromEnv =
    process.env.ADMIN_EMAIL_ALLOWLIST?.split(",").map((s) => s.trim())?.filter(Boolean) ?? [];
  const all = [...fromEnv, ...DEFAULT_ADMIN_ALLOWLIST];
  return Array.from(new Set(all.map((e) => e.toLowerCase())));
}

export function isAllowlistedAdminEmail(email: string) {
  const e = email.trim().toLowerCase();
  return getAdminEmailAllowlist().includes(e) || isSuperAdminEmail(e);
}

export async function isAdminEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if (isAllowlistedAdminEmail(e)) return true;
  const existing = await getUserByEmail(e);
  return Boolean(existing && existing.role === "admin");
}

