import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity } from "../../../../lib/activities";
import { getDictionary, isSupportedLocale, type Locale } from "../../../../lib/i18n";
import ShareButton from "./ui/ShareButton";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);

  let activity = null;
  try {
    activity = await getActivity(id);
  } catch {
    activity = null;
  }
  if (!activity || !activity.published) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-12 sm:px-8">
      <Link
        href={`/${locale}/kegiatan`}
        className="text-sm font-semibold text-zinc-700 hover:text-zinc-950"
      >
        {"<- "} {dict.activities.back}
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
        {activity.title}
      </h1>
      <div className="mt-2 text-sm text-zinc-600">
        {[activity.date, activity.location].filter(Boolean).join(" - ")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ShareButton
          locale={locale}
          title={activity.title}
          text={activity.summary ?? ""}
        />
      </div>

      {activity.coverImageUrl ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-black/10 bg-white/70">
          <Image
            src={activity.coverImageUrl}
            alt={activity.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 900px"
          />
        </div>
      ) : null}

      {activity.summary ? (
        <p className="mt-8 text-base leading-7 text-zinc-700">
          {activity.summary}
        </p>
      ) : null}

      {activity.content ? (
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
          {activity.content}
        </div>
      ) : null}

      {activity.galleryImageUrls?.length ? (
        <section className="mt-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {activity.galleryImageUrls.map((url) => (
              <div
                key={url}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-black/10 bg-white/70"
              >
                <Image
                  src={url}
                  alt={activity.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
