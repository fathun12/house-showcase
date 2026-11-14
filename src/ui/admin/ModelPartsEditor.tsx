"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  AXES,
  DEFAULT_SETTINGS,
  DIRS,
  MOTIONS,
  SIDES,
  otherAxes,
  readSettings,
} from "@/features/model3d/config";
import type { Motion, PartConfig, PartSettings } from "@/features/model3d/config";
import { useModelScene } from "@/features/model3d/useModelScene";
import type { ModelInput, PartInfo } from "@/features/model3d/useModelScene";
import { saveModelParts } from "@/features/models/actions";
import { modelUrl } from "@/features/models/url";
import { cn } from "@/lib/utils/cn";
import type { PublicModel } from "@/types/house";
import { Button } from "@/ui/primitives/Button";
import { Select, TextField } from "@/ui/primitives/Field";

type Edit = { labelId: string; labelEn: string; motion: Motion; settings: PartSettings };

const EMPTY_EDIT: Edit = { labelId: "", labelEn: "", motion: "none", settings: DEFAULT_SETTINGS };
const AMOUNTS = [25, 50, 75, 100, 125, 150];
const ANGLES = [45, 60, 90, 110, 135, -45, -60, -90, -110, -135];

const pad = (value: number) => String(value).padStart(2, "0");
const rowId = (id: string) => `part-row-${id}`;

function initialInput(model: PublicModel): ModelInput[] {
  const configs: Record<string, PartConfig> = {};

  for (const part of model.model_parts) {
    configs[part.node_name] = {
      label: part.label_id || part.label_en,
      motion: part.motion,
      settings: readSettings(part.settings),
    };
  }

  return [{ url: modelUrl(model.storage_path), configs }];
}

function initialEdits(model: PublicModel): Record<string, Edit> {
  const edits: Record<string, Edit> = {};

  for (const part of model.model_parts) {
    edits[part.node_name] = {
      labelId: part.label_id,
      labelEn: part.label_en,
      motion: part.motion,
      settings: readSettings(part.settings),
    };
  }

  return edits;
}

const dirLabel = (dir: string) => `${dir.endsWith("-") ? "\u2212" : "+"}${dir[0].toUpperCase()}`;

/** Admin: name the parts of one 3D file and choose how each one opens, with a live preview.
 *  The preview stays in view while the list scrolls; the selected part glows in the model. */
export function ModelPartsEditor({ model }: { model: PublicModel }) {
  const t = useTranslations("admin.models.parts");
  // Both start from what is saved and are never rebuilt, so the 3D scene is not reloaded after saving
  const [input] = useState(() => initialInput(model));
  const [edits, setEdits] = useState(() => initialEdits(model));
  const [result, setResult] = useState<"idle" | "saved" | "failed">("idle");
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [scrollTick, setScrollTick] = useState(0);

  // A click on a part in the model selects it in the list and scrolls its row into view
  const pick = useCallback((id: string) => {
    setSelected(id);
    setScrollTick((tick) => tick + 1);
  }, []);

  const {
    hostRef,
    parts,
    status,
    toggle,
    toggleOpen,
    showAll,
    resetView,
    applyConfig,
    highlight,
  } = useModelScene(input, true, pick);

  useEffect(() => {
    highlight(selected);
  }, [highlight, selected, status]);

  useEffect(() => {
    if (scrollTick === 0 || selected === null) return;
    document.getElementById(rowId(selected))?.scrollIntoView({ block: "nearest" });
  }, [scrollTick, selected]);

  const index = parts.findIndex((part) => part.id === selected);

  function step(direction: 1 | -1) {
    if (parts.length === 0) return;

    const next =
      index === -1
        ? direction === 1
          ? 0
          : parts.length - 1
        : (index + direction + parts.length) % parts.length;

    pick(parts[next].id);
  }

  function update(part: PartInfo, patch: Partial<Edit>) {
    const next: Edit = { ...(edits[part.key] ?? EMPTY_EDIT), ...patch };
    setEdits((current) => ({ ...current, [part.key]: next }));
    setResult("idle");

    if (patch.motion !== undefined || patch.settings !== undefined) {
      applyConfig(
        part.id,
        { label: next.labelId || next.labelEn, motion: next.motion, settings: next.settings },
        next.motion !== "none",
      );
    }
  }

  function save() {
    startTransition(async () => {
      const response = await saveModelParts({
        modelId: model.id,
        parts: parts.map((part) => {
          const edit = edits[part.key] ?? EMPTY_EDIT;

          return {
            nodeName: part.key,
            labelId: edit.labelId,
            labelEn: edit.labelEn,
            motion: edit.motion,
            settings: edit.settings,
          };
        }),
      });

      setResult(response.ok ? "saved" : "failed");
    });
  }

  const saveBar = (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="button" onClick={save} busy={pending} disabled={status !== "ready"}>
        {pending ? t("saving") : t("save")}
      </Button>
      <p aria-live="polite" className="label">
        {result === "saved" ? `\u2713 ${t("saved")}` : null}
        {result === "failed" ? <span className="text-accent">{t("failed")}</span> : null}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label text-accent">{t("title")}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t("hint")}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t("clickHint")}</p>
      </div>

      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-2 xl:items-start xl:gap-8">
        <div className="sticky top-0 z-20 flex flex-col gap-3 bg-background pt-1 pb-3 xl:top-6 xl:pt-0 xl:pb-0">
          <div className="relative h-[32dvh] min-h-56 border-2 border-foreground bg-stage text-stage-ink xl:h-[calc(100dvh-15rem)] xl:min-h-80">
            <div ref={hostRef} className="absolute inset-0" />
            {status === "loading" ? (
              <p className="label pointer-events-none absolute inset-0 grid place-items-center">
                {t("loading")}
              </p>
            ) : null}
            {status === "error" ? (
              <p
                role="alert"
                className="label absolute inset-0 grid place-items-center p-6 text-center"
              >
                {t("error")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => step(-1)}
              disabled={status !== "ready" || parts.length === 0}
            >
              {"\u2190"} {t("prevPart")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => step(1)}
              disabled={status !== "ready" || parts.length === 0}
            >
              {t("nextPart")} {"\u2192"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetView}
              disabled={status !== "ready"}
            >
              {t("resetView")}
            </Button>
            <Button type="button" variant="outline" onClick={showAll} disabled={status !== "ready"}>
              {t("showAll")}
            </Button>
          </div>

          {status === "ready" && parts.length > 0 ? (
            <p aria-live="polite" className="label text-muted">
              {index >= 0
                ? t("counter", { current: index + 1, total: parts.length })
                : t("counterNone", { total: parts.length })}
            </p>
          ) : null}

          <div className="hidden xl:block">{saveBar}</div>
        </div>

        <div className="min-w-0">
          {status === "ready" && parts.length === 0 ? (
            <p className="text-muted">{t("empty")}</p>
          ) : null}

          <ol className="border-b border-foreground">
            {parts.map((part, position) => {
              const edit = edits[part.key] ?? EMPTY_EDIT;
              const isSelected = part.id === selected;
              const label = edit.labelId || edit.labelEn;
              const [axisA, axisB] = otherAxes(edit.settings.axis);
              const setSettings = (patch: Partial<PartSettings>) =>
                update(part, { settings: { ...edit.settings, ...patch } });

              return (
                <li
                  key={part.id}
                  id={rowId(part.id)}
                  className={cn(
                    "scroll-mt-[44dvh] border-t border-foreground xl:scroll-mt-6",
                    isSelected && "bg-surface",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    onClick={() => setSelected(isSelected ? null : part.id)}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-surface"
                  >
                    <span className="label text-accent">{pad(position + 1)}</span>
                    <span
                      className={cn(
                        "label min-w-0 flex-1 truncate",
                        !part.visible && "line-through",
                      )}
                    >
                      {part.name}
                      {label ? ` \u2014 ${label}` : ""}
                    </span>
                    <span className="label shrink-0 text-muted">{t(`motions.${edit.motion}`)}</span>
                  </button>

                  {isSelected ? (
                    <div className="flex flex-col gap-5 px-3 pb-6">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => toggle(part.id)}>
                          {part.visible ? t("hide") : t("show")}
                        </Button>
                        {part.motion !== "none" ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => toggleOpen(part.id)}
                          >
                            {part.open ? t("testClose") : t("test")}
                          </Button>
                        ) : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                          label={t("labelId")}
                          name={`label-id-${part.id}`}
                          id={`label-id-${part.id}`}
                          value={edit.labelId}
                          maxLength={80}
                          onChange={(event) => update(part, { labelId: event.target.value })}
                        />
                        <TextField
                          label={t("labelEn")}
                          name={`label-en-${part.id}`}
                          id={`label-en-${part.id}`}
                          value={edit.labelEn}
                          maxLength={80}
                          onChange={(event) => update(part, { labelEn: event.target.value })}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                          label={t("motion")}
                          name={`motion-${part.id}`}
                          id={`motion-${part.id}`}
                          value={edit.motion}
                          onChange={(event) =>
                            update(part, { motion: event.target.value as Motion })
                          }
                          options={MOTIONS.map((value) => ({
                            value,
                            label: t(`motions.${value}`),
                          }))}
                        />

                        {edit.motion === "slide" ? (
                          <>
                            <Select
                              label={t("dir")}
                              name={`dir-${part.id}`}
                              id={`dir-${part.id}`}
                              value={edit.settings.dir}
                              onChange={(event) =>
                                setSettings({ dir: event.target.value as PartSettings["dir"] })
                              }
                              options={DIRS.map((value) => ({ value, label: dirLabel(value) }))}
                            />
                            <Select
                              label={t("amount")}
                              name={`amount-${part.id}`}
                              id={`amount-${part.id}`}
                              value={String(edit.settings.amount)}
                              onChange={(event) =>
                                setSettings({ amount: Number(event.target.value) })
                              }
                              options={AMOUNTS.map((value) => ({
                                value: String(value),
                                label: `${value}%`,
                              }))}
                            />
                          </>
                        ) : null}

                        {edit.motion === "hinge" ? (
                          <>
                            <Select
                              label={t("axis")}
                              name={`axis-${part.id}`}
                              id={`axis-${part.id}`}
                              value={edit.settings.axis}
                              onChange={(event) =>
                                setSettings({ axis: event.target.value as PartSettings["axis"] })
                              }
                              options={AXES.map((value) => ({
                                value,
                                label: t(`axes.${value}`),
                              }))}
                            />
                            <Select
                              label={t("angle")}
                              name={`angle-${part.id}`}
                              id={`angle-${part.id}`}
                              value={String(edit.settings.angle)}
                              onChange={(event) =>
                                setSettings({ angle: Number(event.target.value) })
                              }
                              options={ANGLES.map((value) => ({
                                value: String(value),
                                label: `${value}\u00b0`,
                              }))}
                            />
                            <Select
                              label={t("pivot", { axis: axisA.toUpperCase() })}
                              name={`pivot-a-${part.id}`}
                              id={`pivot-a-${part.id}`}
                              value={edit.settings.pivotA}
                              onChange={(event) =>
                                setSettings({
                                  pivotA: event.target.value as PartSettings["pivotA"],
                                })
                              }
                              options={SIDES.map((value) => ({
                                value,
                                label: t(`sides.${value}`),
                              }))}
                            />
                            <Select
                              label={t("pivot", { axis: axisB.toUpperCase() })}
                              name={`pivot-b-${part.id}`}
                              id={`pivot-b-${part.id}`}
                              value={edit.settings.pivotB}
                              onChange={(event) =>
                                setSettings({
                                  pivotB: event.target.value as PartSettings["pivotB"],
                                })
                              }
                              options={SIDES.map((value) => ({
                                value,
                                label: t(`sides.${value}`),
                              }))}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 border-t-2 border-foreground pt-6 xl:hidden">{saveBar}</div>
        </div>
      </div>
    </div>
  );
}