import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { getDictionary, isSupportedLocale, type Locale } from "../../../../lib/i18n";
import UmkmAdminClient from "./ui/UmkmAdminClient";

export default async function AdminUmkmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const session = await getServerSession(authOptions);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8">
      <UmkmAdminClient locale={locale} session={session} adminDict={dict.admin} />
    </main>
  );
}

