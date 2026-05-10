import Link from "next/link";
import { notFound } from "next/navigation";
import { listUmkms } from "../../../lib/umkm";
import { getDictionary, isSupportedLocale, type Locale } from "../../../lib/i18n";
import UmkmClient from "./ui/UmkmClient";

export default async function UmkmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);

  let umkms: Awaited<ReturnType<typeof listUmkms>> = [];
  try {
    umkms = await listUmkms();
  } catch {
    umkms = [];
  }

  const safe = umkms.map((u) => ({
    id: u.id,
    storeName: u.storeName,
    whatsapp: u.whatsapp,
    whatsappE164: u.whatsappE164,
    description: u.description,
    wmbId: u.wmbId,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {locale === "id" ? "UMKM Terdaftar" : "Registered SMEs"}
        </h1>
        <Link
          href={`/${locale}#beranda`}
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-950"
        >
          {"<- "} {dict.header.nav.home}
        </Link>
      </div>

      <UmkmClient
        locale={locale}
        umkms={safe}
        dict={{
          empty: locale === "id" ? "Belum ada UMKM terdaftar." : "No SMEs yet.",
          searchPlaceholder: locale === "id" ? "Cari UMKM..." : "Search SMEs...",
          showingPrefix: locale === "id" ? "Menampilkan" : "Showing",
          contact: locale === "id" ? "Chat WhatsApp" : "WhatsApp",
          wmbIdLabel: "WMB ID",
        }}
      />
    </main>
  );
}

