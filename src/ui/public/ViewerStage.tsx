"use client";

import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import type { ImageView } from "@/features/houses/view";
import { MAX_SCALE, MIN_SCALE, ZOOM_STEP, useZoom } from "@/features/viewer/useZoom";
import { cn } from "@/lib/utils/cn";

const base =
  "label flex min-h-11 min-w-11 items-center justify-center border px-4 whitespace-nowrap transition-colors";
const idle =
  "border-stage-ink text-stage-ink enabled:hover:bg-stage-ink enabled:hover:text-stage disabled:cursor-not-allowed disabled:opacity-40";
const on = "border-accent bg-accent text-accent-ink";

/** The viewer's buttons: sharp, outlined, always at least 44 px tall. */
export function ViewerButton({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(base, active ? on : idle, className)}
      {...props}
    />
  );
}

type Props = {
  image: ImageView;
  infoOpen: boolean;
  onToggleInfo: () => void;
  onStep: (direction: 1 | -1) => void;
};

/** The picture with zoom and pan, and the toolbar under it. Mounted again for every
 *  picture (key), so each picture starts at "fit". */
export function ViewerStage({ image, infoOpen, onToggleInfo, onStep }: Props) {
  const t = useTranslations("public.viewer");
  const { stageRef, view, zoomBy, reset, handlers } = useZoom(
    image.width / image.height,
    onStep,
  );
  const zoomed = view.scale > 1;

  return (
    <>
      <div
        ref={stageRef}
        {...handlers}
        className={cn(
          "relative min-h-0 flex-1 touch-none overflow-hidden select-none",
          zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 will-change-transform",
            view.smooth && "transition-transform duration-150 ease-out motion-reduce:transition-none",
          )}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            unoptimized
            sizes="100vw"
            draggable={false}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-stage-ink/30 p-3 sm:px-6">
        <div className="flex items-center gap-2">
          <ViewerButton
            onClick={() => zoomBy(1 / ZOOM_STEP)}
            disabled={view.scale <= MIN_SCALE}
            aria-label={t("zoomOut")}
            title={t("zoomOut")}
          >
            −
          </ViewerButton>
          <span className="label min-w-14 text-center">{Math.round(view.scale * 100)}%</span>
          <ViewerButton
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={view.scale >= MAX_SCALE}
            aria-label={t("zoomIn")}
            title={t("zoomIn")}
          >
            +
          </ViewerButton>
          <ViewerButton onClick={reset} disabled={!zoomed}>
            {t("fit")}
          </ViewerButton>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ViewerButton onClick={() => onStep(-1)}>
            <span aria-hidden>←</span>
            <span className="sr-only sm:not-sr-only sm:ml-2">{t("prev")}</span>
          </ViewerButton>
          <ViewerButton onClick={() => onStep(1)}>
            <span className="sr-only sm:not-sr-only sm:mr-2">{t("next")}</span>
            <span aria-hidden>→</span>
          </ViewerButton>
          <ViewerButton active={infoOpen} aria-pressed={infoOpen} onClick={onToggleInfo}>
            {t("info")}
          </ViewerButton>
        </div>
      </div>
    </>
  );
}