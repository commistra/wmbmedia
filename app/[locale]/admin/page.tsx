import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { getDictionary, isSupportedLocale, type Locale } from "../../../lib/i18n";
import AdminClient from "./ui/AdminClient";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8">
      <AdminClient locale={locale} dict={dict.admin} session={session} />
    </main>
  );
}
