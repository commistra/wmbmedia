import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { readFileSync } from "fs";
import { join } from "path";
import { getUserByEmail, getUserByIdentifier } from "./users";
import { verifyPassword } from "./password";

const ALLOWED_EMAIL =
  process.env.ADMIN_EMAIL_ALLOWLIST?.split(",").map((s) => s.trim())?.filter(Boolean) ??
  ["bwfzbw@gmail.com"];

let googleClientId = process.env.GOOGLE_CLIENT_ID || "";
let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

// Load from JSON file if env vars are not set
if (!googleClientId || !googleClientSecret) {
  try {
    const credentialsPath = join(process.cwd(), "secret", "google-oauth-client.json");
    const credentials = JSON.parse(readFileSync(credentialsPath, "utf-8"));
    googleClientId = credentials.web.client_id;
    googleClientSecret = credentials.web.client_secret;
  } catch (error) {
    console.error("Failed to load Google credentials from JSON file:", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim() ?? "";
        const password = credentials?.password ?? "";
        if (!identifier || !password) return null;

        const user = await getUserByIdentifier(identifier);
        if (!user?.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (account?.provider === "credentials") return true;

      const allowlist = ALLOWED_EMAIL.map((e) => e.toLowerCase());
      if (allowlist.includes(email)) return true;

      const existing = await getUserByEmail(email);
      return Boolean(existing && existing.role === "admin");
    },
  },
};
