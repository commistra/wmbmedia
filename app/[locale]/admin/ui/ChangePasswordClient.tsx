"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import type { Locale } from "../../../../lib/i18n";

export default function ChangePasswordClient({
  locale,
  session,
}: {
  locale: Locale;
  session: unknown;
}) {
  const { data, status } = useSession();
  const effectiveSession = (data ?? session) as { user?: { email?: string } } | null;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canSubmit = useMemo(() => form.newPassword.length >= 8, [form.newPassword]);

  const submit = async () => {
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed");
      setResult("Password updated.");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!effectiveSession) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
        <div className="text-2xl font-semibold tracking-tight text-zinc-950">
          Change Password
        </div>
        <p className="mt-2 text-sm text-zinc-700">
          {status === "loading" ? "Loading..." : "Please log in first."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: `/${locale}/admin/password` })}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Login with Google
          </button>
          <Link
            href={`/${locale}/admin`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-zinc-950">
            Change Password
          </div>
          <div className="mt-1 text-xs text-zinc-600">{effectiveSession.user?.email ?? ""}</div>
        </div>
        <Link
          href={`/${locale}/admin`}
          className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur hover:bg-white"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-zinc-700">Current password</span>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/70 px-4 pr-16 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-white"
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-zinc-700">New password</span>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/70 px-4 pr-16 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-white"
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
          <span className="text-xs text-zinc-500">Min 8 chars.</span>
        </label>
      </div>

      {result ? <div className="mt-4 text-sm text-zinc-700">{result}</div> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={() => void submit()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Update Password"}
        </button>
        <Link
          href={`/${locale}/admin/register`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
        >
          Register Admin
        </Link>
      </div>
    </div>
  );
}
