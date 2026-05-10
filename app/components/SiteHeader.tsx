"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SUPPORTED_LOCALES, type Locale } from "../../lib/i18n";
import { getWmbWhatsAppJoinUrl } from "../../lib/whatsapp";

type NavItem = { label: string; href: string; kind?: "hash" | "page" };

export default function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: {
    joinCta: string;
    nav: {
      home: string;
      about: string;
      activities: string;
      umkm: string;
      gallery: string;
      contact: string;
      allActivities: string;
      admin: string;
    };
    languageLabel: string;
  };
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale: Locale =
    SUPPORTED_LOCALES.find((l) => l !== locale) ?? "en";

  const switchLocale = () => {
    const nextPath = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, `/${otherLocale}`)
      : `/${otherLocale}`;
    router.push(nextPath);
  };

  const navItems: NavItem[] = useMemo(() => {
    const onHome = pathname === `/${locale}` || pathname === `/${locale}/`;
    const h = (hash: string) => (onHome ? hash : `/${locale}${hash}`);
    return [
      { label: dict.nav.home, href: h("#beranda"), kind: "hash" },
      { label: dict.nav.about, href: h("#tentang"), kind: "hash" },
      { label: dict.nav.activities, href: `/${locale}/kegiatan`, kind: "page" },
      { label: dict.nav.umkm, href: `/${locale}/umkm`, kind: "page" },
      { label: dict.nav.gallery, href: h("#galeri"), kind: "hash" },
      { label: dict.nav.contact, href: h("#kontak"), kind: "hash" },
      { label: dict.nav.admin, href: `/${locale}/admin`, kind: "page" },
    ];
  }, [dict, locale, pathname]);

  const joinUrl = useMemo(
    () =>
      getWmbWhatsAppJoinUrl(
        locale === "id"
          ? "Halo admin WMB, saya ingin gabung komunitas."
          : "Hi WMB admin, I'd like to join the community."
      ),
    [locale]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur border-b border-black/5"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <a
              href="#beranda"
              className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900"
            >
              <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-xl border border-black/10 bg-white">
                <Image src="/logo-wmb.png" alt="WMB" fill className="object-cover" />
              </span>
              <span className="hidden sm:block">WMB</span>
            </a>

            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 md:flex">
              {navItems.map((item) =>
                item.kind === "page" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-medium transition-colors hover:text-zinc-950"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="font-medium transition-colors hover:text-zinc-950"
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={switchLocale}
                className="hidden h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white md:inline-flex"
                aria-label={dict.languageLabel}
              >
                {locale.toUpperCase()}
              </button>
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 md:inline-flex"
              >
                {dict.joinCta}
              </a>

              <button
                type="button"
                aria-label="Buka menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-zinc-900 backdrop-blur transition-colors hover:bg-white md:hidden"
              >
                <span className="sr-only">Menu</span>
                <div className="flex w-5 flex-col gap-1.5">
                  <span className="h-0.5 w-full rounded bg-zinc-900" />
                  <span className="h-0.5 w-full rounded bg-zinc-900" />
                  <span className="h-0.5 w-full rounded bg-zinc-900" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[60] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 h-full w-full bg-black/30 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-16 items-center justify-between border-b border-black/5 px-5">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-xl border border-black/10 bg-white">
                <Image src="/logo-wmb.png" alt="WMB" fill className="object-cover" />
              </span>
              <span>WMB</span>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              X
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-5 text-sm font-semibold text-zinc-900">
            {navItems.map((item) =>
              item.kind === "page" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  {item.label}
                </a>
              )
            )}
            <button
              type="button"
              onClick={() => {
                switchLocale();
                setOpen(false);
              }}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              {dict.languageLabel}: {otherLocale.toUpperCase()}
            </button>
            <a
              href={joinUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {dict.joinCta}
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}
