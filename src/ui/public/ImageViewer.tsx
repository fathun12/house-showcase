"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { HouseContent } from "@/features/houses/view";
import { ViewerContext } from "@/features/viewer/context";
import { buildJumps } from "@/features/viewer/items";
import type { ViewerItem, ViewerJump } from "@/features/viewer/items";
import { useScrollLock, useViewer, useViewerKeys } from "@/features/viewer/useViewer";
import { ViewerPanel } from "@/ui/public/ViewerPanel";
import type { Spec } from "@/ui/public/ViewerPanel";
import { ViewerButton, ViewerStage } from "@/ui/public/ViewerStage";

const pad = (value: number) => String(value).padStart(2, "0");

type Props = {
  items: ViewerItem[];
  title: string;
  tagline: string;
  facts: HouseContent["facts"];
  children: ReactNode;
};

/** Wraps the house page: every <ViewerTrigger> inside it opens the viewer. */
export function ImageViewer({ items, title, tagline, facts, children }: Props) {
  const t = useTranslations("public");
  const format = useFormatter();
  const viewer = useViewer(items);

  const specs = [
    facts.floors !== null && { label: t("summary.floors"), value: format.number(facts.floors) },
    facts.bedrooms !== null && {
      label: t("summary.bedrooms"),
      value: format.number(facts.bedrooms),
    },
    facts.bathrooms !== null && {
      label: t("summary.bathrooms"),
      value: format.number(facts.bathrooms),
    },
    facts.area !== null && {
      label: t("summary.area"),
      value: format.number(facts.area, { maximumFractionDigits: 1 }),
    },
  ].filter((spec): spec is Spec => Boolean(spec));

  return (
    <ViewerContext.Provider value={viewer.open}>
      {children}

      {viewer.item ? (
        <ViewerDialog
          item={viewer.item}
          position={viewer.position}
          count={viewer.count}
          previousSrc={viewer.previousSrc}
          nextSrc={viewer.nextSrc}
          title={title}
          tagline={tagline}
          specs={specs}
          jumps={buildJumps(items)}
          onClose={viewer.close}
          onStep={viewer.step}
          onOpen={viewer.open}
        />
      ) : null}
    </ViewerContext.Provider>
  );
}

type DialogProps = {
  item: ViewerItem;
  position: number;
  count: number;
  previousSrc: string;
  nextSrc: string;
  title: string;
  tagline: string;
  specs: Spec[];
  jumps: ViewerJump[];
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
  onOpen: (key: string) => void;
};

/** A native modal <dialog>: the page behind it is inert and Esc closes it. It only exists
 *  while open, so it is never rendered on the server. */
function ViewerDialog({
  item,
  position,
  count,
  previousSrc,
  nextSrc,
  title,
  tagline,
  specs,
  jumps,
  onClose,
  onStep,
  onOpen,
}: DialogProps) {
  const t = useTranslations("public.viewer");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  // Remember what had focus (the clicked picture) to give it back when the viewer closes
  const [previousFocus] = useState(() => document.activeElement);

  useScrollLock();
  useViewerKeys(onStep);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [previousFocus]);

  // Load the pictures on both sides in advance, so moving between them is instant
  useEffect(() => {
    for (const src of [previousSrc, nextSrc]) {
      if (!src) continue;
      const preload = new window.Image();
      preload.src = src;
    }
  }, [previousSrc, nextSrc]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("label")}
      onClose={onClose}
      className="viewer-in fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none flex-col overflow-hidden border-0 bg-background p-0 text-foreground open:flex lg:flex-row"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-stage text-stage-ink">
        <div className="flex items-center gap-4 border-b border-stage-ink/30 px-4 py-2 sm:px-6">
          <p className="label">
            {pad(position)} / {pad(count)}
          </p>
          <p className="label hidden flex-1 text-stage-ink/60 sm:block">
            <span className="hidden [@media(pointer:fine)]:inline">{t("hintMouse")}</span>
            <span className="hidden [@media(pointer:coarse)]:inline">{t("hintTouch")}</span>
          </p>
          <ViewerButton onClick={onClose} className="ml-auto">
            {t("close")}
            <span aria-hidden className="ml-3 hidden opacity-60 [@media(pointer:fine)]:inline">
              Esc
            </span>
          </ViewerButton>
        </div>

        <ViewerStage
          key={item.key}
          image={item.image}
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
          onStep={onStep}
        />
      </div>

      {infoOpen ? (
        <ViewerPanel
          key={item.key}
          item={item}
          title={title}
          tagline={tagline}
          specs={specs}
          jumps={jumps}
          onJump={onOpen}
        />
      ) : null}
    </dialog>
  );
}