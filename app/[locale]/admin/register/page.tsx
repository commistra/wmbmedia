import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { isSupportedLocale, type Locale } from "../../../../lib/i18n";
import RegisterAdminClient from "../ui/RegisterAdminClient";

export default async function AdminRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-8">
      <RegisterAdminClient locale={locale} session={session} />
    </main>
  );
}

