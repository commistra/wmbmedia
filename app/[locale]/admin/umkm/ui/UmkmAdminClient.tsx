"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../../../../lib/i18n";

type Umkm = {
  id: string;
  storeName: string;
  whatsapp: string;
  whatsappE164?: string;
  description: string;
  wmbId: string;
};

function waLink(umkm: Umkm) {
  const raw = (umkm.whatsappE164 ?? umkm.whatsapp ?? "").trim();
  const stripped = raw.replace(/[^\d+]/g, "");
  const noPlus = stripped.startsWith("+") ? stripped.slice(1) : stripped;
  const digits = noPlus.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

export default function UmkmAdminClient({
  locale,
  session,
  adminDict,
}: {
  locale: Locale;
  session: unknown;
  adminDict: { signIn: string; signOut: string };
}) {
  const { data, status } = useSession();
  const effectiveSession = (data ?? session) as { user?: { email?: string } } | null;

  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => umkms.find((u) => u.id === selectedId) ?? null, [umkms, selectedId]);

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return umkms;
    return umkms.filter((u) => {
      const hay = `${u.storeName} ${u.wmbId} ${u.whatsapp}`.toLowerCase();
      return hay.includes(q);
    });
  }, [umkms, search]);

  const [form, setForm] = useState<Omit<Umkm, "id">>({
    storeName: "",
    whatsapp: "",
    description: "",
    wmbId: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/umkm", { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as { umkms?: Umkm[]; error?: string } | null;
      if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`);
      setUmkms(json?.umkms ?? []);
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!effectiveSession) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSession?.user?.email]);

  useEffect(() => {
    setResult(null);
    if (!selected) {
      setForm({ storeName: "", whatsapp: "", description: "", wmbId: "" });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _unusedId, whatsappE164: _unusedWa, ...rest } = selected as Umkm & {
      whatsappE164?: string;
    };
    setForm({
      storeName: rest.storeName ?? "",
      whatsapp: rest.whatsapp ?? "",
      description: rest.description ?? "",
      wmbId: rest.wmbId ?? "",
    });
  }, [selected]);

  const save = async () => {
    setResult(null);
    setSaving(true);
    try {
      const payload = selectedId ? { id: selectedId, ...form } : form;
      const res = await fetch("/api/admin/umkm", {
        method: selectedId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`);
      await refresh();
      setResult(locale === "id" ? "Tersimpan." : "Saved.");
      if (!selectedId) setForm({ storeName: "", whatsapp: "", description: "", wmbId: "" });
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    setResult(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/umkm?id=${encodeURIComponent(selectedId)}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`);
      await refresh();
      setSelectedId(null);
      setResult(locale === "id" ? "Terhapus." : "Deleted.");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleting(false);
    }
  };

  if (!effectiveSession) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {locale === "id" ? "Admin UMKM" : "UMKM Admin"}
            </div>
            <p className="mt-2 text-sm text-zinc-700">
              {status === "loading"
                ? locale === "id"
                  ? "Memuat..."
                  : "Loading..."
                : locale === "id"
                  ? "Silakan login dulu."
                  : "Please log in first."}
            </p>
          </div>
          <Link
            href={`/${locale}/admin`}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur hover:bg-white"
          >
            {locale === "id" ? "Kembali" : "Back"}
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: `/${locale}/admin/umkm` })}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            {adminDict.signIn}
          </button>
          <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {locale === "id" ? "Login Admin" : "Admin Login"}
            </div>
            <div className="mt-3 grid gap-3">
              <input
                value={login.identifier}
                onChange={(e) => setLogin((p) => ({ ...p, identifier: e.target.value }))}
                placeholder={locale === "id" ? "Username / Email" : "Username / Email"}
                className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
              />
              <input
                value={login.password}
                type="password"
                onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
                placeholder={locale === "id" ? "Password" : "Password"}
                className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
              />
              {loginError ? (
                <div className="text-xs font-semibold text-red-700">{loginError}</div>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  setLoginError(null);
                  const res = await signIn("credentials", {
                    identifier: login.identifier,
                    password: login.password,
                    redirect: false,
                    callbackUrl: `/${locale}/admin/umkm`,
                  });
                  if (res?.error) setLoginError(res.error);
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
              >
                {locale === "id" ? "Login" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight text-zinc-950">
              {locale === "id" ? "Daftar UMKM" : "UMKM List"}
            </div>
            <div className="mt-1 text-xs text-zinc-600">{effectiveSession.user?.email ?? ""}</div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}/admin/umkm` })}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            {adminDict.signOut}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/admin`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            {locale === "id" ? "Admin Kegiatan" : "Activities Admin"}
          </Link>
          <Link
            href={`/${locale}/umkm`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            {locale === "id" ? "Lihat UMKM" : "View UMKM"}
          </Link>
        </div>

        <div className="mt-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "id" ? "Cari UMKM..." : "Search UMKM..."}
            className="h-11 w-full rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
          />
          <div className="mt-2 text-xs text-zinc-600">
            {locale === "id"
              ? `Menampilkan ${filtered.length} dari ${umkms.length}`
              : `Showing ${filtered.length} of ${umkms.length}`}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={[
              "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
              !selectedId
                ? "border-pink-500/30 bg-pink-50 text-zinc-950"
                : "border-black/10 bg-white/60 text-zinc-900 hover:bg-white/80",
            ].join(" ")}
          >
            {locale === "id" ? "+ Tambah UMKM" : "+ Add UMKM"}
          </button>

          {filtered.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id)}
              className={[
                "rounded-2xl border px-4 py-3 text-left transition-colors",
                selectedId === u.id
                  ? "border-pink-500/30 bg-pink-50"
                  : "border-black/10 bg-white/60 hover:bg-white/80",
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-zinc-950">{u.storeName}</div>
              <div className="mt-1 text-xs text-zinc-600">{u.wmbId}</div>
            </button>
          ))}
        </div>

        {loading ? <div className="mt-4 text-xs text-zinc-600">Loading...</div> : null}
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight text-zinc-950">
              {selectedId
                ? locale === "id"
                  ? "Edit UMKM"
                  : "Edit UMKM"
                : locale === "id"
                  ? "Tambah UMKM"
                  : "Add UMKM"}
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              {selectedId ? `ID: ${selectedId}` : locale === "id" ? "Entry baru" : "New entry"}
            </div>
          </div>

          {selected ? (
            <a
              href={waLink(selected) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
            >
              WhatsApp
            </a>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">
              {locale === "id" ? "Nama toko" : "Store name"}
            </span>
            <input
              value={form.storeName}
              onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">
              {locale === "id" ? "WA toko" : "WhatsApp"}
            </span>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              placeholder={locale === "id" ? "contoh: 0823xxxx / +62823xxx" : "e.g. +62823..."}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">WMB ID</span>
            <input
              value={form.wmbId}
              onChange={(e) => setForm((p) => ({ ...p, wmbId: e.target.value }))}
              placeholder={locale === "id" ? "Input manual" : "Manual input"}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">
              {locale === "id" ? "Deskripsi toko" : "Description"}
            </span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={6}
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
        </div>

        {result ? <div className="mt-4 text-sm text-zinc-700">{result}</div> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => void save()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? (locale === "id" ? "Menyimpan..." : "Saving...") : locale === "id" ? "Simpan" : "Save"}
          </button>
          {selectedId ? (
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => void remove()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-red-500/20 bg-red-50 px-6 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? (locale === "id" ? "Menghapus..." : "Deleting...") : locale === "id" ? "Hapus" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
