"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useHouseForm } from "@/features/houses/useHouseForm";
import { Link } from "@/lib/i18n/navigation";
import type { House, HouseKind } from "@/types/house";
import { BilingualField } from "@/ui/admin/BilingualField";
import { FormSection } from "@/ui/admin/FormShell";
import { TranslateButton } from "@/ui/admin/TranslateButton";
import { Button, buttonStyles } from "@/ui/primitives/Button";
import { Checkbox, TextField } from "@/ui/primitives/Field";

const KNOWN_ERRORS = new Set([
  "too_small",
  "too_big",
  "invalid_format",
  "invalid_type",
  "duplicate",
  "save_failed",
]);

const HOUSE_TRANSLATE = ["title", "tagline", "why", "notes"] as const;
const FURNITURE_TRANSLATE = ["title", "tagline", "material", "finish", "why", "notes"] as const;

export function HouseForm({ house, kind }: { house: House | null; kind: HouseKind }) {
  const t = useTranslations("admin.houseForm");
  const tf = useTranslations("admin.furnitureForm");
  const { values, errors, formAction, isPending } = useHouseForm(house, kind);
  const isFurniture = kind === "furniture";

  const error = (field: string) => {
    const code = errors[field];
    if (!code) return undefined;
    return t(`errors.${KNOWN_ERRORS.has(code) ? code : "invalid"}`);
  };

  // Field messages sit under their fields, far above the Save button on a long form.
  // After a failed save, a summary at the top of the form is scrolled into view.
  const summaryRef = useRef<HTMLDivElement>(null);

  const problems = Object.entries(errors).filter(
    (entry): entry is [string, string] => Boolean(entry[1]) && entry[0] !== "form",
  );

  const labels: Record<string, string> = {
    slug: t("fields.slug"),
    title: t("fields.title"),
    tagline: t("fields.tagline"),
    designer: t("fields.designer"),
    whatsapp: t("fields.whatsapp"),
    floors: t("fields.floors"),
    bedrooms: t("fields.bedrooms"),
    bathrooms: t("fields.bathrooms"),
    area_m2: t("fields.area"),
    sort_order: t("fields.order"),
    length_cm: tf("fields.length"),
    width_cm: tf("fields.width"),
    height_cm: tf("fields.height"),
    material: tf("fields.material"),
    finish: tf("fields.finish"),
    why: isFurniture ? tf("fields.why") : t("fields.why"),
    notes: isFurniture ? tf("fields.notes") : t("fields.notes"),
  };

  const labelOf = (field: string) => {
    const base = field.replace(/_(id|en)$/, "");
    const suffix = field.endsWith("_id") ? " / ID" : field.endsWith("_en") ? " / EN" : "";
    return `${labels[base] ?? field}${suffix}`;
  };

  useEffect(() => {
    const hasFieldErrors = Object.entries(errors).some(
      ([field, code]) => code && field !== "form",
    );

    if (hasFieldErrors) {
      summaryRef.current?.scrollIntoView({ block: "center" });
      summaryRef.current?.focus({ preventScroll: true });
    } else if (errors.form) {
      window.scrollTo({ top: 0 });
    }
  }, [errors]);

  return (
    <form action={formAction} className="flex flex-col gap-12">
      <input type="hidden" name="kind" value={kind} />

      {problems.length > 0 ? (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="border-2 border-accent p-4 text-accent outline-none"
        >
          <p className="label">{t("errors.summary")}</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {problems.map(([field, code]) => (
              <li key={field}>
                {labelOf(field)}: {t(`errors.${KNOWN_ERRORS.has(code) ? code : "invalid"}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error("form") ? (
        <p role="alert" className="label border-2 border-accent p-4 text-accent">
          {error("form")}
        </p>
      ) : null}

      <FormSection index="01" title={t("sections.basics")}>
        <TextField
          label={t("fields.slug")}
          name="slug"
          defaultValue={values.slug}
          hint={t("hints.slug")}
          error={error("slug")}
          required
        />
        <BilingualField
          label={t("fields.title")}
          name="title"
          defaults={{ id: values.title_id, en: values.title_en }}
          errors={{ id: error("title_id"), en: error("title_en") }}
          required
        />
        <BilingualField
          label={t("fields.tagline")}
          name="tagline"
          defaults={{ id: values.tagline_id, en: values.tagline_en }}
          errors={{ id: error("tagline_id"), en: error("tagline_en") }}
        />
        <TextField
          label={t("fields.designer")}
          name="designer"
          defaultValue={values.designer}
          hint={isFurniture ? tf("hints.designer") : t("hints.designer")}
          error={error("designer")}
        />
        <TextField
          label={t("fields.whatsapp")}
          name="whatsapp"
          inputMode="tel"
          defaultValue={values.whatsapp}
          hint={t("hints.whatsapp")}
          error={error("whatsapp")}
        />
      </FormSection>

      {isFurniture ? (
        <FormSection index="02" title={tf("sections.size")}>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <TextField
              label={tf("fields.length")}
              name="length_cm"
              inputMode="decimal"
              defaultValue={values.length_cm}
              error={error("length_cm")}
            />
            <TextField
              label={tf("fields.width")}
              name="width_cm"
              inputMode="decimal"
              defaultValue={values.width_cm}
              error={error("width_cm")}
            />
            <TextField
              label={tf("fields.height")}
              name="height_cm"
              inputMode="decimal"
              defaultValue={values.height_cm}
              error={error("height_cm")}
            />
            <TextField
              label={t("fields.order")}
              name="sort_order"
              inputMode="numeric"
              defaultValue={values.sort_order}
              error={error("sort_order")}
            />
          </div>
          <BilingualField
            label={tf("fields.material")}
            name="material"
            defaults={{ id: values.material_id, en: values.material_en }}
            errors={{ id: error("material_id"), en: error("material_en") }}
          />
          <BilingualField
            label={tf("fields.finish")}
            name="finish"
            defaults={{ id: values.finish_id, en: values.finish_en }}
            errors={{ id: error("finish_id"), en: error("finish_en") }}
          />
        </FormSection>
      ) : (
        <FormSection index="02" title={t("sections.facts")}>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            <TextField
              label={t("fields.floors")}
              name="floors"
              inputMode="numeric"
              defaultValue={values.floors}
              error={error("floors")}
            />
            <TextField
              label={t("fields.bedrooms")}
              name="bedrooms"
              inputMode="numeric"
              defaultValue={values.bedrooms}
              error={error("bedrooms")}
            />
            <TextField
              label={t("fields.bathrooms")}
              name="bathrooms"
              inputMode="numeric"
              defaultValue={values.bathrooms}
              error={error("bathrooms")}
            />
            <TextField
              label={t("fields.area")}
              name="area_m2"
              inputMode="decimal"
              defaultValue={values.area_m2}
              error={error("area_m2")}
            />
            <TextField
              label={t("fields.order")}
              name="sort_order"
              inputMode="numeric"
              defaultValue={values.sort_order}
              error={error("sort_order")}
            />
          </div>
        </FormSection>
      )}

      <FormSection index="03" title={t("sections.story")}>
        <BilingualField
          label={isFurniture ? tf("fields.why") : t("fields.why")}
          name="why"
          multiline
          rows={6}
          defaults={{ id: values.why_id, en: values.why_en }}
          errors={{ id: error("why_id"), en: error("why_en") }}
        />
        <BilingualField
          label={isFurniture ? tf("fields.notes") : t("fields.notes")}
          name="notes"
          multiline
          rows={6}
          defaults={{ id: values.notes_id, en: values.notes_en }}
          errors={{ id: error("notes_id"), en: error("notes_en") }}
        />
      </FormSection>

      <FormSection index="04" title={t("sections.publish")}>
        <Checkbox
          label={t("fields.published")}
          name="is_published"
          defaultChecked={values.is_published === "on"}
          hint={isFurniture ? tf("hints.published") : t("hints.published")}
        />
      </FormSection>

      <div className="flex flex-wrap gap-4 border-t-2 border-foreground pt-8">
        <Button type="submit" busy={isPending}>
          {isPending ? t("saving") : t("save")}
        </Button>
        <Link
          href={isFurniture ? "/admin/furniture" : "/admin/houses"}
          className={buttonStyles("outline")}
        >
          {t("cancel")}
        </Link>
        <TranslateButton bases={isFurniture ? FURNITURE_TRANSLATE : HOUSE_TRANSLATE} />
      </div>
    </form>
  );
}