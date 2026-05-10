"use client";

import { useMemo, useState } from "react";
import type { Locale } from "../../../../lib/i18n";

type Umkm = {
  id: string;
  storeName: string;
  whatsapp: string;
  whatsappE164?: string;
  description: string;
  wmbId: string;
};

function getWhatsAppUrl(umkm: Umkm) {
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

export default function UmkmClient({
  locale,
  umkms,
  dict,
}: {
  locale: Locale;
  umkms: Umkm[];
  dict: {
    empty: string;
    searchPlaceholder: string;
    showingPrefix: string;
    contact: string;
    wmbIdLabel: string;
  };
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return umkms;
    return umkms.filter((u) => {
      const hay = `${u.storeName} ${u.wmbId} ${u.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [umkms, search]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="h-11 w-full rounded-2xl border border-black/10 bg-white/70 px-4 text-sm text-zinc-950 outline-none focus:border-pink-500/40"
          />
          <div className="mt-2 text-xs text-zinc-600">
            {locale === "id"
              ? `${dict.showingPrefix} ${filtered.length} dari ${umkms.length}`
              : `${dict.showingPrefix} ${filtered.length} of ${umkms.length}`}
          </div>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => {
            const waUrl = getWhatsAppUrl(u);
            return (
              <div
                key={u.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold text-zinc-950">
                        {u.storeName}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {dict.wmbIdLabel}: {u.wmbId}
                      </div>
                    </div>
                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                      >
                        {dict.contact}
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-700">
                    {u.description}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-600">
                    <div className="truncate">{u.whatsapp}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-600">{dict.empty}</p>
      )}
    </div>
  );
}
