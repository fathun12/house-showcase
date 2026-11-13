"use client";

import { useState, useTransition } from "react";
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
import { useRouter } from "@/lib/i18n/navigation";
import type { PublicModel } from "@/types/house";
import { Button } from "@/ui/primitives/Button";
import { Select, TextField } from "@/ui/primitives/Field";

type Edit = { labelId: string; labelEn: string; motion: Motion; settings: PartSettings };

const EMPTY_EDIT: Edit = { labelId: "", labelEn: "", motion: "none", settings: DEFAULT_SETTINGS };
const AMOUNTS = [25, 50, 75, 100, 125, 150];
const ANGLES = [45, 60, 90, 110, 135, -45, -60, -90, -110, -135];

const pad = (value: number) => String(value).padStart(2, "0");

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

/** Admin: name the parts of one 3D file and choose how each one opens, with a live preview. */
export function ModelPartsEditor({ model }: { model: PublicModel }) {
  const t = useTranslations("admin.models.parts");
  const router = useRouter();
  // Both start from what is saved and are never rebuilt, so the 3D scene is not reloaded after saving
  const [input] = useState(() => initialInput(model));
  const [edits, setEdits] = useState(() => initialEdits(model));
  const [result, setResult] = useState<"idle" | "saved" | "failed">("idle");
  const [pending, startTransition] = useTransition();

  const { hostRef, parts, status, toggle, toggleOpen, showAll, resetView, applyConfig } =
    useModelScene(input, true);

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
      if (response.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label text-accent">{t("title")}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t("hint")}</p>
      </div>

      <div className="relative h-[55dvh] min-h-80 border-2 border-foreground bg-stage text-stage-ink">
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
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={resetView} disabled={status !== "ready"}>
          {t("resetView")}
        </Button>
        <Button type="button" variant="outline" onClick={showAll} disabled={status !== "ready"}>
          {t("showAll")}
        </Button>
      </div>

      {status === "ready" && parts.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}

      <ol>
        {parts.map((part, index) => {
          const edit = edits[part.key] ?? EMPTY_EDIT;
          const [axisA, axisB] = otherAxes(edit.settings.axis);
          const setSettings = (patch: Partial<PartSettings>) =>
            update(part, { settings: { ...edit.settings, ...patch } });

          return (
            <li key={part.id} className="flex flex-col gap-5 border-t border-foreground py-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="label">
                  <span className="text-accent">{pad(index + 1)}</span> / {part.name}
                </p>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => toggle(part.id)}>
                    {part.visible ? t("hide") : t("show")}
                  </Button>
                  {part.motion !== "none" ? (
                    <Button type="button" variant="outline" onClick={() => toggleOpen(part.id)}>
                      {part.open ? t("testClose") : t("test")}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
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

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Select
                  label={t("motion")}
                  name={`motion-${part.id}`}
                  id={`motion-${part.id}`}
                  value={edit.motion}
                  onChange={(event) => update(part, { motion: event.target.value as Motion })}
                  options={MOTIONS.map((value) => ({ value, label: t(`motions.${value}`) }))}
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
                      onChange={(event) => setSettings({ amount: Number(event.target.value) })}
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
                      options={AXES.map((value) => ({ value, label: t(`axes.${value}`) }))}
                    />
                    <Select
                      label={t("angle")}
                      name={`angle-${part.id}`}
                      id={`angle-${part.id}`}
                      value={String(edit.settings.angle)}
                      onChange={(event) => setSettings({ angle: Number(event.target.value) })}
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
                        setSettings({ pivotA: event.target.value as PartSettings["pivotA"] })
                      }
                      options={SIDES.map((value) => ({ value, label: t(`sides.${value}`) }))}
                    />
                    <Select
                      label={t("pivot", { axis: axisB.toUpperCase() })}
                      name={`pivot-b-${part.id}`}
                      id={`pivot-b-${part.id}`}
                      value={edit.settings.pivotB}
                      onChange={(event) =>
                        setSettings({ pivotB: event.target.value as PartSettings["pivotB"] })
                      }
                      options={SIDES.map((value) => ({ value, label: t(`sides.${value}`) }))}
                    />
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-4 border-t-2 border-foreground pt-6">
        <Button type="button" onClick={save} disabled={pending || status !== "ready"}>
          {pending ? t("saving") : t("save")}
        </Button>
        <p aria-live="polite" className="label">
          {result === "saved" ? t("saved") : null}
          {result === "failed" ? <span className="text-accent">{t("failed")}</span> : null}
        </p>
      </div>
    </div>
  );
}