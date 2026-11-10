"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ViewerItem } from "@/features/viewer/items";
import { useScrollLock } from "@/features/viewer/useViewer";
import { ViewerButton } from "@/ui/public/ViewerStage";

const pad = (value: number) => String(value).padStart(2, "0");

type Props = {
  /** One slide per room that has photos */
  slides: ViewerItem[];
  onClose: () => void;
};

/** Full-screen presentation, one room per slide. Arrow keys and Page Down/Up move
 *  (clickers send Page Down/Up); Esc leaves. Only mounted while presenting. */
export function Presenter({ slides, onClose }: Props) {
  const t = useTranslations("public");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  // Remember what had focus to give it back when the presentation ends
  const [previousFocus] = useState(() => document.activeElement);
  const last = slides.length - 1;

  useScrollLock();

  const step = useCallback(
    (direction: 1 | -1) =>
      setIndex((current) => Math.min(last, Math.max(0, current + direction))),
    [last],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") step(1);
      if (event.key === "ArrowLeft" || event.key === "PageUp") step(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    // Esc first leaves browser full screen; treat that as "end the presentation"
    let entered = false;
    const onFullscreen = () => {
      if (document.fullscreenElement) entered = true;
      else if (entered) onClose();
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    dialog.requestFullscreen?.().catch(() => {});

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose, previousFocus]);

  // Load the pictures on both sides in advance
  useEffect(() => {
    for (const neighbour of [slides[index - 1], slides[index + 1]]) {
      if (!neighbour) continue;
      const preload = new window.Image();
      preload.src = neighbour.image.src;
    }
  }, [slides, index]);

  const slide = slides[index];
  const room = slide.room;

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("present.label")}
      onClose={onClose}
      className="viewer-in fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none flex-col overflow-hidden border-0 bg-stage p-0 text-stage-ink open:flex"
    >
      <div className="relative min-h-0 flex-1">
        <Image
          key={slide.key}
          src={slide.image.src}
          alt={slide.image.alt}
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {room ? (
        <div className="grid max-h-[34dvh] gap-4 overflow-y-auto border-t-2 border-stage-ink px-6 py-5 md:grid-cols-12 md:gap-10 md:px-10">
          <div className="md:col-span-4">
            <p className="flex items-baseline gap-4">
              <span className="font-mono text-5xl font-bold text-accent md:text-6xl">
                {room.number}
              </span>
              <span className="heading text-3xl md:text-4xl">{room.name}</span>
            </p>
            {room.floor !== null ? (
              <p className="label mt-3 text-stage-ink/60">
                {t("rooms.floor", { floor: room.floor })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 md:col-span-8">
            {room.description ? (
              <p className="max-w-[65ch] text-lg whitespace-pre-line md:text-xl">
                {room.description}
              </p>
            ) : null}
            {room.rationale ? (
              <div className="max-w-[65ch] border-l-4 border-accent pl-5">
                <p className="label text-accent">{t("rooms.rationale")}</p>
                <p className="mt-2 text-lg whitespace-pre-line">{room.rationale}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-stage-ink/30 p-3 sm:px-6">
        <p className="label">
          {pad(index + 1)} / {pad(slides.length)}
        </p>
        <p className="label hidden flex-1 px-4 text-stage-ink/60 md:block">{t("present.hint")}</p>
        <div className="ml-auto flex items-center gap-2">
          <ViewerButton onClick={() => step(-1)} disabled={index === 0}>
            <span aria-hidden>←</span>
            <span className="sr-only sm:not-sr-only sm:ml-2">{t("viewer.prev")}</span>
          </ViewerButton>
          <ViewerButton onClick={() => step(1)} disabled={index === last}>
            <span className="sr-only sm:not-sr-only sm:mr-2">{t("viewer.next")}</span>
            <span aria-hidden>→</span>
          </ViewerButton>
          <ViewerButton onClick={onClose}>
            {t("viewer.close")}
            <span aria-hidden className="ml-3 hidden opacity-60 [@media(pointer:fine)]:inline">
              Esc
            </span>
          </ViewerButton>
        </div>
      </div>
    </dialog>
  );
}