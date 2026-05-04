import crypto from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTS: crypto.ScryptOptions = {
  N: 1 << 15,
  r: 8,
  p: 1,
  // OpenSSL 3 defaults may enforce a low memory limit for scrypt.
  // With N=2^15,r=8 this can exceed 32MB and throw:
  // "Invalid scrypt params ... memory limit exceeded"
  maxmem: 128 * 1024 * 1024,
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTS) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const key = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTS) as Buffer;
  const storedKey = Buffer.from(hex, "hex");
  if (storedKey.length !== key.length) return false;
  return crypto.timingSafeEqual(storedKey, key);
}
