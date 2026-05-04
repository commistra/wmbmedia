"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import FadeIn from "./FadeIn";

type GalleryItem = {
  title: string;
  subtitle: string;
  tag: string;
  imageSrc: string;
  alt: string;
  spanClass: string;
  heightClass: string;
};

export default function GallerySectionClient({
  dict,
  items,
}: {
  dict: {
    title: string;
    body: string;
    latest: string;
    close: string;
    closeAria: string;
  };
  items: GalleryItem[];
}) {
  const [active, setActive] = useState<GalleryItem | null>(null);
  const visibleItems = useMemo(() => items, [items]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:gap-5">
        {visibleItems.map((item, idx) => (
          <FadeIn
            key={item.imageSrc}
            delayMs={60 * idx}
            className={["md:col-span-6", item.spanClass].join(" ")}
          >
            <button
              type="button"
              onClick={() => setActive(item)}
              className={[
                "group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-white/70 text-left shadow-sm backdrop-blur transition",
                "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60",
                item.heightClass,
              ].join(" ")}
            >
              <Image
                src={item.imageSrc}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  {item.subtitle ? (
                    <div className="mt-1 truncate text-xs text-white/80">
                      {item.subtitle}
                    </div>
                  ) : null}
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {item.tag}
                </span>
              </div>
            </button>
          </FadeIn>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${active.title}`}
        >
          <button
            type="button"
            aria-label={dict.closeAria}
            onClick={() => setActive(null)}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <div className="relative z-[1] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="relative aspect-[16/10] w-full bg-black">
              <Image
                src={active.imageSrc}
                alt={active.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  {active.title}
                </div>
                {active.subtitle ? (
                  <div className="mt-1 text-xs text-white/70">
                    {active.subtitle}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                {dict.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

