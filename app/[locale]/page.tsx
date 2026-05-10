import Image from "next/image";
import FadeIn from "../components/FadeIn";
import GallerySection from "../components/GallerySection";
import { getDictionary, isSupportedLocale, type Locale } from "../../lib/i18n";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWmbWhatsAppJoinUrl } from "../../lib/whatsapp";
import ExpandableText from "../components/ExpandableText";
import { listActivities } from "../../lib/activities";
import { listUmkms } from "../../lib/umkm";

function toWaUrl(value?: string) {
  const raw = (value ?? "").trim();
  const stripped = raw.replace(/[^\d+]/g, "");
  const noPlus = stripped.startsWith("+") ? stripped.slice(1) : stripped;
  const digits = noPlus.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

function DotGrid() {
  return (
    <div className="absolute right-[260px] top-[150px] hidden grid-cols-6 gap-3 md:grid z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-zinc-900/80"
        />
      ))}
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);
  const joinUrl =
    locale === "id"
      ? getWmbWhatsAppJoinUrl("Halo admin WMB, saya ingin gabung komunitas.")
      : getWmbWhatsAppJoinUrl("Hi WMB admin, I'd like to join the community.");

  let latestActivities: Awaited<ReturnType<typeof listActivities>> = [];
  try {
    latestActivities = await listActivities();
  } catch {
    latestActivities = [];
  }
  latestActivities = latestActivities.filter((a) => a.published).slice(0, 3);

  let latestUmkms: Awaited<ReturnType<typeof listUmkms>> = [];
  try {
    latestUmkms = await listUmkms({ limit: 6 });
  } catch {
    latestUmkms = [];
  }

  return (
    <main id="beranda" className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="relative flex flex-col items-center gap-12 pb-16 pt-16 md:flex-row md:items-start md:justify-between md:pb-24 md:pt-24">
          <FadeIn className="w-full max-w-xl md:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur">
              {dict.landing.badge}
              <span className="h-1 w-1 rounded-full bg-zinc-400" />
              Wirausaha Muda Bregas
            </p>

            <h1 className="mt-6 text-[42px] font-bold leading-[1.1] tracking-tight text-zinc-950 md:text-[64px]">
              {dict.landing.titleLines[0]}
              <br />
              {dict.landing.titleLines[1]}
              <br />
              {dict.landing.titleLines[2]}
            </h1>

            <p className="mt-5 text-[16px] font-light leading-[1.6] text-zinc-700">
              {dict.landing.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                {dict.landing.ctaPrimary}
              </a>
              <a
                href="#tentang"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
              >
                {dict.landing.ctaSecondary}
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {dict.landing.stats.map((item) => (
                <div
                  key={item.k}
                  className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {item.k}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900">
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="relative w-full max-w-[520px] md:order-2">
            <DotGrid />

            <FadeIn className="relative w-full h-[450px]" delayMs={100}>
              <div className="absolute bottom-0 right-0 h-[320px] w-[320px] overflow-hidden rounded-full border-[10px] border-pink-500 z-10">
                <Image
                  src="/gallery/lingkar-besar.png"
                  alt="WMB"
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>

              <div className="absolute right-[50px] top-0 h-[140px] w-[140px] overflow-hidden rounded-full border-[8px] border-amber-500 z-20">
                <Image
                  src="/musollin.png"
                  alt={dict.landing.founderName}
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>
            </FadeIn>
          </div>
        </section>

        <section
          id="tentang"
          className="border-t border-black/5 py-16 md:py-24"
        >
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <FadeIn>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {dict.landing.aboutTitle}
              </h2>
              <ExpandableText
                locale={locale}
                text={dict.landing.aboutBody}
                className="mt-4 text-base leading-7 text-zinc-700 sm:text-lg sm:leading-8"
                collapsedHeightClassName="max-h-48 sm:max-h-56"
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {dict.landing.aboutCards.map((card, idx) => (
                  <FadeIn key={card.title} delayMs={80 * idx}>
                    <div className="h-full rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur">
                      <div className="text-sm font-semibold text-zinc-950">
                        {card.title}
                      </div>
                      <ExpandableText
                        locale={locale}
                        text={card.desc}
                        className="mt-2 text-sm leading-6 text-zinc-700"
                        collapsedHeightClassName="max-h-44"
                        minLengthForToggle={180}
                      />
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>

            <FadeIn delayMs={120}>
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/gallery/fotbar.png"
                    alt={dict.landing.aboutPhotoTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm font-semibold text-zinc-950">
                    {dict.landing.aboutPhotoTitle}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-700">
                    {dict.landing.aboutPhotoBody}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="kegiatan" className="pb-20 md:pb-28">
          <FadeIn>
            <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur md:p-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">
                    {dict.landing.activitiesTitle}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-zinc-700">
                    {dict.landing.activitiesBody}
                  </p>
                </div>
                <Link
                  href={`/${locale}/kegiatan`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
                >
                  {dict.header.nav.activities}
                </Link>
              </div>

              {latestActivities.length ? (
                <div className="mt-8">
                  <div className="text-sm font-semibold text-zinc-950">
                    {dict.landing.latestActivitiesTitle}
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    {dict.landing.latestActivitiesBody}
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {latestActivities.map((a) => (
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
                        <div className="p-5">
                          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {a.date ?? ""}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-zinc-950">
                            {a.title}
                          </div>
                          {a.summary ? (
                            <div className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700">
                              {a.summary}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </FadeIn>
        </section>

        {latestUmkms.length ? (
          <section id="umkm" className="pb-20 md:pb-28">
            <FadeIn>
              <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur md:p-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">
                      {locale === "id" ? "UMKM Terdaftar" : "Registered SMEs"}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-zinc-700">
                      {locale === "id"
                        ? "Beberapa UMKM yang sudah terdaftar di komunitas."
                        : "A few SMEs registered in the community."}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/umkm`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
                  >
                    {locale === "id" ? "Lihat semua" : "View all"}
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {latestUmkms.slice(0, 6).map((u) => {
                    const waUrl = toWaUrl(u.whatsappE164 || u.whatsapp);
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
                                WMB ID: {u.wmbId}
                              </div>
                            </div>
                            {waUrl ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                              >
                                WhatsApp
                              </a>
                            ) : null}
                          </div>
                          <div className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-700">
                            {u.description}
                          </div>
                          <div className="mt-4 truncate text-xs text-zinc-600">
                            {u.whatsapp}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </section>
        ) : null}

        <section className="pb-20 md:pb-28">
          <FadeIn>
            <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                    {dict.landing.founderTitle}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                    {dict.landing.founderName}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-600">
                    {dict.landing.founderRole}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-zinc-700">
                    {dict.landing.founderBody}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <Image
                      src="/musollin.png"
                      alt={dict.landing.founderName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm font-semibold text-zinc-900">WMB</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <GallerySection dict={dict.gallery} />

        <section id="kontak" className="pb-24">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-zinc-950 px-8 py-10 text-white md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {dict.landing.contactTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  {dict.landing.contactBody}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
                  <a
                    href="https://www.instagram.com/reel/DX4JLBvx5i0/?igsh=MTBlOWltY2Jkc2IxNg=="
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://vt.tiktok.com/ZS9x1K3L9/"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15"
                  >
                    TikTok
                  </a>
                  <a
                    href="https://youtube.com/shorts/PDUzaNdUS1E?si=RrJCE2x5eR1VEncd"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15"
                  >
                    YouTube
                  </a>
                </div>
              </div>
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white/90"
              >
                {dict.landing.contactCta}
              </a>
            </div>
          </FadeIn>
        </section>
    </main>
  );
}
