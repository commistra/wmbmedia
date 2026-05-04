import { notFound } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import { getDictionary, isSupportedLocale, type Locale } from "../../lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-100 via-white to-slate-50">
      <SiteHeader locale={locale} dict={dict.header} />
      <div className="pt-16">{children}</div>
      <footer className="border-t border-black/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="font-medium text-zinc-800">
            {dict.landing.footerOrg}
          </div>
          <div>
            {dict.landing.footerCopyrightPrefix} {new Date().getFullYear()}{" "}
            Wirausaha Muda Bregas
          </div>
        </div>
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return [{ locale: "id" as Locale }, { locale: "en" as Locale }];
}
