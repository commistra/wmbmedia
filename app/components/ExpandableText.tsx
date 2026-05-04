"use client";

import { useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n";

export default function ExpandableText({
  locale,
  text,
  className,
  collapsedHeightClassName = "max-h-40",
  minLengthForToggle = 220,
}: {
  locale: Locale;
  text: string;
  className?: string;
  collapsedHeightClassName?: string;
  minLengthForToggle?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const canToggle = text.trim().length >= minLengthForToggle;

  const labels = useMemo(() => {
    if (locale === "id") return { more: "Baca selengkapnya", less: "Tutup" };
    return { more: "Read more", less: "Show less" };
  }, [locale]);

  return (
    <div className={className}>
      <div
        className={[
          "relative whitespace-pre-line",
          expanded || !canToggle ? "" : `${collapsedHeightClassName} overflow-hidden`,
        ].join(" ")}
      >
        {text}
        {expanded || !canToggle ? null : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 to-transparent" />
        )}
      </div>

      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white"
        >
          {expanded ? labels.less : labels.more}
        </button>
      ) : null}
    </div>
  );
}
