const DEFAULT_SUPERADMIN_EMAIL = "bwfzbw@gmail.com";

export function getSuperAdminEmail() {
  return (process.env.SUPERADMIN_EMAIL ?? DEFAULT_SUPERADMIN_EMAIL).toLowerCase();
}

export function isSuperAdminEmail(email?: string | null) {
  if (!email) return false;
  return email.toLowerCase() === getSuperAdminEmail();
}

