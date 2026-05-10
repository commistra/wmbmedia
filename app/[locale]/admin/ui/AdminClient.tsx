"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../../../../lib/i18n";

type Activity = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  published: boolean;
};

export default function AdminClient({
  locale,
  dict,
  session,
}: {
  locale: Locale;
  dict: {
    title: string;
    signIn: string;
    signOut: string;
    forbidden: string;
    form: {
      new: string;
      edit: string;
      name: string;
      date: string;
      location: string;
      summary: string;
      content: string;
      coverImage: string;
      galleryImages: string;
      publish: string;
      save: string;
      delete: string;
      uploading: string;
    };
  };
  session: unknown;
}) {
  const { data, status } = useSession();
  const effectiveSession = (data ?? session) as { user?: { email?: string } } | null;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const selected = useMemo(
    () => activities.find((a) => a.id === selectedId) ?? null,
    [activities, selectedId]
  );
  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => (a.title ?? "").toLowerCase().includes(q));
  }, [activities, search]);
  const visibleActivities = useMemo(
    () => filteredActivities.slice(0, 12),
    [filteredActivities]
  );

  const [form, setForm] = useState<Omit<Activity, "id">>({
    title: "",
    date: "",
    location: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    galleryImageUrls: [],
    published: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      const json = (await res.json()) as { activities?: Activity[] };
      setActivities(json.activities ?? []);
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
    if (!selected) {
      setForm({
        title: "",
        date: "",
        location: "",
        summary: "",
        content: "",
        coverImageUrl: "",
        galleryImageUrls: [],
        published: false,
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _unusedId, ...rest } = selected;
    setForm(rest);
  }, [selected]);

  const onUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "/wmb");
      const res = await fetch("/api/imagekit/upload", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`);
      if (!json?.url) throw new Error("Upload failed (missing url)");
      if (!json.url) throw new Error("Upload failed");
      setForm((prev) => ({ ...prev, coverImageUrl: json.url }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      title: form.title.trim(),
      published: Boolean(form.published),
      galleryImageUrls: form.galleryImageUrls ?? [],
    };

    try {
      const res = selectedId
        ? await fetch(`/api/activities/${selectedId}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/activities", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("Save failed");
      await refresh();
      setSelectedId(null);
      setSearch("");
      setForm({
        title: "",
        date: "",
        location: "",
        summary: "",
        content: "",
        coverImageUrl: "",
        galleryImageUrls: [],
        published: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    if (!window.confirm("Hapus postingan ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/activities/${selectedId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
      setSelectedId(null);
      setForm({
        title: "",
        date: "",
        location: "",
        summary: "",
        content: "",
        coverImageUrl: "",
        galleryImageUrls: [],
        published: false,
      });
    } finally {
      setDeleting(false);
    }
  };

  const removeById = async (id: string) => {
    if (!window.confirm("Hapus postingan ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
      if (selectedId === id) {
        setSelectedId(null);
        setForm({
          title: "",
          date: "",
          location: "",
          summary: "",
          content: "",
          coverImageUrl: "",
          galleryImageUrls: [],
          published: false,
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!effectiveSession) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
        <div className="text-2xl font-semibold tracking-tight text-zinc-950">
          {dict.title}
        </div>
        <p className="mt-2 text-sm text-zinc-700">
          {status === "loading" ? "..." : ""}
        </p>

        <div className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">
              Username / Email
            </span>
            <input
              value={login.identifier}
              onChange={(e) =>
                setLogin((p) => ({ ...p, identifier: e.target.value }))
              }
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">Password</span>
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                value={login.password}
                onChange={(e) =>
                  setLogin((p) => ({ ...p, password: e.target.value }))
                }
                className="h-11 w-full rounded-2xl border border-black/10 bg-white/70 px-4 pr-16 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-white"
              >
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {loginError ? (
            <div className="text-sm text-red-700">{loginError}</div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={async () => {
                setLoginError(null);
                const res = await signIn("credentials", {
                  identifier: login.identifier,
                  password: login.password,
                  redirect: false,
                  callbackUrl: `/${locale}/admin`,
                });
                if (res?.error) setLoginError("Login failed.");
                if (res?.ok) window.location.href = `/${locale}/admin`;
              }}
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: `/${locale}/admin` })}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
            >
              {dict.signIn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {dict.title}
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              {effectiveSession.user?.email ?? ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur hover:bg-white"
          >
            {dict.signOut}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">
            {loading ? "..." : `${activities.length} items`}
          </div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700"
          >
            + {dict.form.new}
          </button>
        </div>

        <div className="mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "id" ? "Cari postingan..." : "Search posts..."}
            className="h-10 w-full rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
          />
          <div className="mt-2 text-xs text-zinc-600">
            {locale === "id"
              ? `Menampilkan ${Math.min(visibleActivities.length, 12)} dari ${filteredActivities.length}`
              : `Showing ${Math.min(visibleActivities.length, 12)} of ${filteredActivities.length}`}
          </div>
        </div>

        <div className="mt-6 grid gap-2">
          <Link
            href={`/${locale}/admin/register`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            Register Admin
          </Link>
          <Link
            href={`/${locale}/admin/umkm`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            {locale === "id" ? "Admin UMKM" : "UMKM Admin"}
          </Link>
          <Link
            href={`/${locale}/admin/password`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
          >
            Change Password
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {visibleActivities.map((a) => (
            <div
              key={a.id}
              className={[
                "flex items-start justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition",
                selectedId === a.id
                  ? "border-pink-500/40 bg-pink-50"
                  : "border-black/10 bg-white/70 hover:bg-white",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedId(a.id);
                  window.setTimeout(() => {
                    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-sm font-semibold text-zinc-950">{a.title}</div>
                <div className="mt-1 text-xs text-zinc-600">
                  {(a.published ? "published" : "draft") + (a.date ? ` - ${a.date}` : "")}
                </div>
              </button>
              <button
                type="button"
                aria-label="Hapus"
                onClick={() => void removeById(a.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 text-zinc-900 hover:bg-white"
                title="Hapus"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div ref={formRef} className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="text-lg font-semibold text-zinc-950">
          {selected ? dict.form.edit : dict.form.new}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">{dict.form.name}</span>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">{dict.form.date}</span>
            <input
              type="date"
              value={form.date ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">{dict.form.location}</span>
            <input
              value={form.location ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="h-11 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">{dict.form.summary}</span>
            <textarea
              value={form.summary ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              rows={3}
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">{dict.form.content}</span>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={10}
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
            <div className="text-xs font-semibold text-zinc-700">{dict.form.coverImage}</div>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white">
                Pilih file
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />
              </label>
              {uploading ? (
                <span className="text-xs text-zinc-600">{dict.form.uploading}</span>
              ) : null}
            </div>
            {uploadError ? (
              <div className="mt-2 text-xs font-semibold text-red-700">{uploadError}</div>
            ) : null}
            {form.coverImageUrl ? (
              <div className="mt-2 break-all text-xs text-zinc-600">{form.coverImageUrl}</div>
            ) : null}
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/60 p-4">
            <input
              type="checkbox"
              checked={Boolean(form.published)}
              onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
            />
            <span className="text-sm font-semibold text-zinc-900">{dict.form.publish}</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            {dict.form.save}
          </button>
          {selectedId ? (
            <button
              type="button"
              onClick={() => void remove()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-red-500/20 bg-red-50 px-6 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              {dict.form.delete}
            </button>
          ) : null}
        </div>
      </div>

      {(saving || deleting) && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/30 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white/90 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <div className="text-sm font-semibold text-zinc-900">
                {deleting
                  ? locale === "id"
                    ? "Menghapus..."
                    : "Deleting..."
                  : locale === "id"
                    ? "Menyimpan..."
                    : "Saving..."}
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-600">
              {locale === "id"
                ? "Mohon tunggu sebentar."
                : "Please wait a moment."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
