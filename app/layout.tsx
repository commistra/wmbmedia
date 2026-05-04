import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { isSupportedLocale, type Locale } from "../lib/i18n";
import Providers from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WMB — Wirausaha Muda Bregas",
  description:
    "Komunitas UMKM Tegal untuk bertumbuh, berjejaring, dan berkolaborasi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const lang: Locale = isSupportedLocale(localeCookie) ? localeCookie : "id";

  return (
    <html
      lang={lang}
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
