import fs from "node:fs";
import path from "node:path";
import FadeIn from "./FadeIn";
import GallerySectionClient from "./GallerySectionClient";

type GalleryItem = {
  title: string;
  subtitle: string;
  tag: string;
  imageSrc: string;
  alt: string;
  spanClass: string;
  heightClass: string;
};

function titleFromFileName(fileName: string) {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return base
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getGalleryItems(): GalleryItem[] {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(galleryDir)) return [];
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
  const files = fs
    .readdirSync(galleryDir)
    .filter((f) => allowed.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const spans = [
    { spanClass: "md:col-span-7", heightClass: "h-72 sm:h-80" },
    { spanClass: "md:col-span-5", heightClass: "h-72 sm:h-80" },
    { spanClass: "md:col-span-4", heightClass: "h-64 sm:h-72" },
    { spanClass: "md:col-span-4", heightClass: "h-64 sm:h-72" },
    { spanClass: "md:col-span-4", heightClass: "h-64 sm:h-72" },
    { spanClass: "md:col-span-6", heightClass: "h-56 sm:h-64" },
    { spanClass: "md:col-span-6", heightClass: "h-56 sm:h-64" },
  ];

  return files.map((fileName, idx) => {
    const layout = spans[idx % spans.length];
    const title = titleFromFileName(fileName);
    return {
      title,
      subtitle: "",
      tag: "Gallery",
      imageSrc: `/gallery/${fileName}`,
      alt: `Foto kegiatan: ${title}`,
      spanClass: layout.spanClass,
      heightClass: layout.heightClass,
    };
  });
}

export default function GallerySection({
  dict,
}: {
  dict: {
    title: string;
    body: string;
    latest: string;
    close: string;
    closeAria: string;
  };
}) {
  const items = getGalleryItems();

  return (
    <section id="galeri" className="border-t border-black/5 py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <FadeIn className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {dict.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-700 sm:text-lg sm:leading-8">
            {dict.body}
          </p>
        </FadeIn>

        <FadeIn delayMs={120} className="shrink-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur">
            {dict.latest}
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
          </span>
        </FadeIn>
      </div>

      <GallerySectionClient dict={dict} items={items} />
    </section>
  );
}

