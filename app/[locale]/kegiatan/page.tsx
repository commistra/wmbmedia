import Link from "next/link";
import { notFound } from "next/navigation";
import { listActivities } from "../../../lib/activities";
import { getDictionary, isSupportedLocale, type Locale } from "../../../lib/i18n";
import KegiatanClient from "./KegiatanClient";

export default async function KegiatanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);
  let activities: Awaited<ReturnType<typeof listActivities>> = [];
  try {
    activities = await listActivities();
  } catch {
    activities = [];
  }
  const safeActivities = activities.map((a) => ({
    id: a.id,
    title: a.title,
    date: a.date,
    location: a.location,
    summary: a.summary,
    coverImageUrl: a.coverImageUrl,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {dict.activities.title}
        </h1>
        <Link
          href={`/${locale}#kegiatan`}
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-950"
        >
          {dict.activities.back}
        </Link>
      </div>

      <KegiatanClient
        locale={locale}
        activities={safeActivities}
        dict={{
          empty: dict.activities.empty,
          readMore: dict.activities.readMore,
          searchPlaceholder: locale === "id" ? "Cari kegiatan..." : "Search activities...",
          showingPrefix: locale === "id" ? "Menampilkan" : "Showing",
        }}
      />
    </main>
  );
}
