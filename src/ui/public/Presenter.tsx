"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { RoomSlide } from "@/features/viewer/items";
import { useScrollLock } from "@/features/viewer/useViewer";
import { cn } from "@/lib/utils/cn";
import { ViewerButton } from "@/ui/public/ViewerStage";

const pad = (value: number) => String(value).padStart(2, "0");

type Props = {
  /** One slide per room that has photos */
  slides: RoomSlide[];
  onClose: () => void;
};

/** Full-screen presentation, one room per slide, with all of the room's photos inside it.
 *  Left/Right arrows move between the photos of a room; Page Down/Up (clickers send those)
 *  and the bottom buttons move between rooms; Esc leaves. Only mounted while presenting. */
export function Presenter({ slides, onClose }: Props) {
  const t = useTranslations("public");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pos, setPos] = useState({ room: 0, photo: 0 });
  // Remember what had focus to give it back when the presentation ends
  const [previousFocus] = useState(() => document.activeElement);
  const lastRoom = slides.length - 1;

  useScrollLock();

  const stepRoom = useCallback(
    (direction: 1 | -1) =>
      setPos((current) => {
        const room = Math.min(lastRoom, Math.max(0, current.room + direction));
        return room === current.room ? current : { room, photo: 0 };
      }),
    [lastRoom],
  );

  const stepPhoto = useCallback(
    (direction: 1 | -1) =>
      setPos((current) => {
        const count = slides[current.room].images.length;
        const photo = Math.min(count - 1, Math.max(0, current.photo + direction));
        return photo === current.photo ? current : { ...current, photo };
      }),
    [slides],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

      if (event.key === "ArrowRight") stepPhoto(1);
      else if (event.key === "ArrowLeft") stepPhoto(-1);
      else if (event.key === "PageDown") {
        event.preventDefault();
        stepRoom(1);
      } else if (event.key === "PageUp") {
        event.preventDefault();
        stepRoom(-1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepPhoto, stepRoom]);

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

  // Load what can come next in advance: the next and previous photo, and the next room
  useEffect(() => {
    const current = slides[pos.room];
    const sources = [
      current.images[pos.photo + 1]?.src,
      current.images[pos.photo - 1]?.src,
      slides[pos.room + 1]?.images[0]?.src,
    ];

    for (const src of sources) {
      if (!src) continue;
      const preload = new window.Image();
      preload.src = src;
    }
  }, [slides, pos]);

  const slide = slides[pos.room];
  const room = slide.room;
  const image = slide.images[pos.photo];
  const photoCount = slide.images.length;

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("present.label")}
      onClose={onClose}
      className="viewer-in fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none flex-col overflow-hidden border-0 bg-stage p-0 text-stage-ink open:flex"
    >
      <div className="relative min-h-0 flex-1">
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-contain"
        />

        {photoCount > 1 ? (
          <>
            <ViewerButton
              onClick={() => stepPhoto(-1)}
              disabled={pos.photo === 0}
              aria-label={t("present.prevPhoto")}
              title={t("present.prevPhoto")}
              className="absolute top-1/2 left-3 min-h-14 min-w-14 -translate-y-1/2 bg-stage/70 sm:left-5"
            >
              <span aria-hidden className="text-xl">
                ←
              </span>
            </ViewerButton>
            <ViewerButton
              onClick={() => stepPhoto(1)}
              disabled={pos.photo === photoCount - 1}
              aria-label={t("present.nextPhoto")}
              title={t("present.nextPhoto")}
              className="absolute top-1/2 right-3 min-h-14 min-w-14 -translate-y-1/2 bg-stage/70 sm:right-5"
            >
              <span aria-hidden className="text-xl">
                →
              </span>
            </ViewerButton>

            <p className="label absolute bottom-3 left-3 flex items-center gap-3 bg-stage/70 px-3 py-2 sm:left-5">
              <span>
                {pad(pos.photo + 1)} / {pad(photoCount)}
              </span>
              <span aria-hidden className="flex gap-1">
                {slide.images.map((photo, index) => (
                  <span
                    key={photo.src}
                    className={cn(
                      "h-1.5 w-5",
                      index === pos.photo ? "bg-accent" : "bg-stage-ink/30",
                    )}
                  />
                ))}
              </span>
            </p>
          </>
        ) : null}
      </div>

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

      <div className="flex flex-wrap items-center gap-2 border-t border-stage-ink/30 p-3 sm:px-6">
        <p className="label">
          {pad(pos.room + 1)} / {pad(slides.length)}
        </p>
        <p className="label hidden flex-1 px-4 text-stage-ink/60 md:block">{t("present.hint")}</p>
        <div className="ml-auto flex items-center gap-2">
          <ViewerButton
            onClick={() => stepRoom(-1)}
            disabled={pos.room === 0}
            aria-label={t("present.prevRoom")}
          >
            <span aria-hidden>←</span>
            <span className="sr-only sm:not-sr-only sm:ml-2">{t("present.prevRoom")}</span>
          </ViewerButton>
          <ViewerButton
            onClick={() => stepRoom(1)}
            disabled={pos.room === lastRoom}
            aria-label={t("present.nextRoom")}
          >
            <span className="sr-only sm:not-sr-only sm:mr-2">{t("present.nextRoom")}</span>
            <span aria-hidden>→</span>
          </ViewerButton>
          <ViewerButton onClick={onClose}>
            {t("viewer.close")}
            <span aria-hidden className="ml-3 hidden opacity-60 pointer-fine:inline">
              Esc
            </span>
          </ViewerButton>
        </div>
      </div>
    </dialog>
  );
}