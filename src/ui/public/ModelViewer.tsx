"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { ModelView } from "@/features/furniture/view";
import { useModelScene } from "@/features/model3d/useModelScene";
import { cn } from "@/lib/utils/cn";
import { ViewerButton } from "@/ui/public/ViewerStage";

const subscribeCoarse = (onChange: () => void) => {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isCoarse = () => window.matchMedia("(pointer: coarse)").matches;
const notCoarse = () => false;

/** The 3D stage. With a mouse it is interactive in the page; on a touch screen it is a
 *  preview (so the page still scrolls) and a tap opens it full screen, where it is interactive. */
export function ModelViewer({ models }: { models: ModelView[] }) {
  const t = useTranslations("public.furniture.model");
  const coarse = useSyncExternalStore(subscribeCoarse, isCoarse, notCoarse);
  const [expanded, setExpanded] = useState(false);
  const interactive = !coarse || expanded;

  const { hostRef, parts, status, toggle, toggleOpen, setAllOpen, showAll, resetView } =
    useModelScene(models, interactive);

  const allVisible = parts.every((part) => part.visible);
  const openable = parts.filter((part) => part.motion !== "none");
  const allOpen = openable.length > 0 && openable.every((part) => part.open);
  const showParts = parts.length > 1 || openable.length > 0;

  // Full screen: freeze the page behind it, and let Escape close it
  useEffect(() => {
    if (!expanded) return;

    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  return (
    <div
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? true : undefined}
      aria-label={t("label")}
      className={cn(
        "flex flex-col bg-stage text-stage-ink",
        expanded ? "fixed inset-0 z-50" : "relative",
      )}
    >
      <div className="flex items-center gap-4 border-b border-stage-ink/30 px-4 py-2 sm:px-6">
        <p className="label">{t("title")}</p>
        <p className="label hidden flex-1 text-stage-ink/60 sm:block">
          <span className="hidden pointer-fine:inline">{t("hintMouse")}</span>
          <span className="hidden pointer-coarse:inline">{t("hintTouch")}</span>
        </p>
        <ViewerButton onClick={() => setExpanded((open) => !open)} className="ml-auto">
          {expanded ? t("close") : t("expand")}
          {expanded ? (
            <span aria-hidden className="ml-3 hidden opacity-60 [@media(pointer:fine)]:inline">
              Esc
            </span>
          ) : null}
        </ViewerButton>
      </div>

      <div
        className={cn(
          "relative min-h-0",
          expanded ? "flex-1" : "h-[70dvh] min-h-96 lg:h-[78dvh]",
        )}
      >
        <div ref={hostRef} className="absolute inset-0" />

        {status === "loading" ? (
          <p className="label pointer-events-none absolute inset-0 grid place-items-center">
            {t("loading")}
          </p>
        ) : null}

        {status === "error" ? (
          <p role="alert" className="label absolute inset-0 grid place-items-center p-6 text-center">
            {t("error")}
          </p>
        ) : null}

        {!interactive && status === "ready" ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="label absolute inset-0 flex items-end justify-center pb-6"
          >
            <span className="bg-accent px-4 py-3 text-accent-ink">{t("tapToOpen")}</span>
          </button>
        ) : null}
      </div>

      <div className="border-t border-stage-ink/30 p-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <ViewerButton onClick={resetView} disabled={status !== "ready"}>
            {t("resetView")}
          </ViewerButton>
          {openable.length > 0 ? (
            <ViewerButton onClick={() => setAllOpen(!allOpen)}>
              {allOpen ? t("closeAll") : t("openAll")}
            </ViewerButton>
          ) : null}
          {parts.length > 1 ? (
            <ViewerButton onClick={showAll} disabled={allVisible}>
              {t("showAll")}
            </ViewerButton>
          ) : null}
        </div>

        {openable.length > 0 ? (
          <p className="label mt-3 text-stage-ink/60">{t("openHint")}</p>
        ) : null}

        {showParts ? (
          <div className="mt-3">
            <p className="label text-stage-ink/60">{t("parts")}</p>
            <ul
              className={cn(
                "mt-2 flex gap-2",
                expanded ? "overflow-x-auto pb-1 sm:flex-wrap" : "flex-wrap",
              )}
            >
              {parts.map((part, index) => (
                <li key={part.id} className="flex shrink-0">
                  <ViewerButton
                    active={part.visible}
                    aria-pressed={part.visible}
                    onClick={() => toggle(part.id)}
                    className={cn(!part.visible && "line-through")}
                  >
                    {part.label || t("part", { number: index + 1 })}
                  </ViewerButton>
                  {part.motion !== "none" ? (
                    <ViewerButton
                      active={part.open}
                      aria-pressed={part.open}
                      onClick={() => toggleOpen(part.id)}
                      className="-ml-px"
                    >
                      {part.open ? t("closePart") : t("openPart")}
                    </ViewerButton>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}