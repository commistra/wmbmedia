"use client";

import { useMemo, useState } from "react";
import type { Locale } from "../../../../../lib/i18n";

export default function ShareButton({
  locale,
  title,
  text,
}: {
  locale: Locale;
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  const labels = useMemo(() => {
    if (locale === "id") return { share: "Share", copied: "Link disalin" };
    return { share: "Share", copied: "Link copied" };
  }, [locale]);

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
    >
      {copied ? labels.copied : labels.share}
    </button>
  );
}

