"use client";

import { useTranslations } from "next-intl";
import { useHouseForm } from "@/features/houses/useHouseForm";
import { Link } from "@/lib/i18n/navigation";
import type { House } from "@/types/house";
import { BilingualField } from "@/ui/admin/BilingualField";
import { FormSection } from "@/ui/admin/FormShell";
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

export function HouseForm({ house }: { house: House | null }) {
  const t = useTranslations("admin.houseForm");
  const { values, errors, formAction, isPending } = useHouseForm(house);

  const error = (field: string) => {
    const code = errors[field];
    if (!code) return undefined;
    return t(`errors.${KNOWN_ERRORS.has(code) ? code : "invalid"}`);
  };

  return (
    <form action={formAction} className="flex flex-col gap-12">
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
      </FormSection>

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

      <FormSection index="03" title={t("sections.story")}>
        <BilingualField
          label={t("fields.why")}
          name="why"
          multiline
          rows={6}
          defaults={{ id: values.why_id, en: values.why_en }}
          errors={{ id: error("why_id"), en: error("why_en") }}
        />
        <BilingualField
          label={t("fields.notes")}
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
          hint={t("hints.published")}
        />
      </FormSection>

      <div className="flex flex-wrap gap-4 border-t-2 border-foreground pt-8">
        <Button type="submit" disabled={isPending}>
          {t("save")}
        </Button>
        <Link href="/admin/houses" className={buttonStyles("outline")}>
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}