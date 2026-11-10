"use client";

import { useTranslations } from "next-intl";
import { useRoomForm } from "@/features/rooms/useRoomForm";
import { Link } from "@/lib/i18n/navigation";
import type { Room } from "@/types/house";
import { BilingualField } from "@/ui/admin/BilingualField";
import { FormSection } from "@/ui/admin/FormShell";
import { TranslateButton } from "@/ui/admin/TranslateButton";
import { Button, buttonStyles } from "@/ui/primitives/Button";
import { TextField } from "@/ui/primitives/Field";

const KNOWN_ERRORS = new Set([
  "too_small",
  "too_big",
  "invalid_type",
  "save_failed",
]);

const TRANSLATE_FIELDS = ["name", "description", "rationale"] as const;

export function RoomForm({ houseId, room }: { houseId: string; room: Room | null }) {
  const t = useTranslations("admin.roomForm");
  const { values, errors, formAction, isPending } = useRoomForm(houseId, room);

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
        <BilingualField
          label={t("fields.name")}
          name="name"
          defaults={{ id: values.name_id, en: values.name_en }}
          errors={{ id: error("name_id"), en: error("name_en") }}
          required
        />
        <div className="grid grid-cols-2 gap-6 md:max-w-md">
          <TextField
            label={t("fields.floor")}
            name="floor"
            inputMode="numeric"
            defaultValue={values.floor}
            error={error("floor")}
          />
          <TextField
            label={t("fields.position")}
            name="position"
            inputMode="numeric"
            defaultValue={values.position}
            hint={t("hints.position")}
            error={error("position")}
          />
        </div>
      </FormSection>

      <FormSection index="02" title={t("sections.story")}>
        <BilingualField
          label={t("fields.description")}
          name="description"
          multiline
          rows={5}
          defaults={{ id: values.description_id, en: values.description_en }}
          errors={{ id: error("description_id"), en: error("description_en") }}
        />
        <BilingualField
          label={t("fields.rationale")}
          name="rationale"
          multiline
          rows={5}
          defaults={{ id: values.rationale_id, en: values.rationale_en }}
          errors={{ id: error("rationale_id"), en: error("rationale_en") }}
        />
      </FormSection>

      <div className="flex flex-wrap gap-4 border-t-2 border-foreground pt-8">
        <Button type="submit" disabled={isPending}>
          {t("save")}
        </Button>
        <Link href={`/admin/houses/${houseId}/rooms`} className={buttonStyles("outline")}>
          {t("cancel")}
        </Link>
        <TranslateButton bases={TRANSLATE_FIELDS} />
      </div>
    </form>
  );
}