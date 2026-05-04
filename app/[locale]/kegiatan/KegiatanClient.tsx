"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";

type Activity = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  summary?: string;
  coverImageUrl?: string;
};

export default function KegiatanClient({
  locale,
  dict,
  activities,
}: {
  locale: Locale;
  dict: {
    empty: string;
    readMore: string;
    searchPlaceholder: string;
    showing: (visible: number, total: number) => string;
  };
  activities: Activity[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => (a.title ?? "").toLowerCase().includes(q));
  }, [activities, search]);

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
            {dict.showing(filtered.length, activities.length)}
          </div>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/${locale}/kegiatan/${a.id}`}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full bg-zinc-100">
                {a.coverImageUrl ? (
                  <Image
                    src={a.coverImageUrl}
                    alt={a.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 380px"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-zinc-400">
                    WMB
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {[a.date, a.location].filter(Boolean).join(" - ")}
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-950">
                  {a.title}
                </div>
                {a.summary ? (
                  <div className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-700">
                    {a.summary}
                  </div>
                ) : null}
                <div className="mt-4 text-sm font-semibold text-pink-600">
                  {dict.readMore} {"->"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-600">{dict.empty}</p>
      )}
    </div>
  );
}

