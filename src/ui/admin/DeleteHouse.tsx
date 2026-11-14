import { useTranslations } from "next-intl";
import type { HouseKind } from "@/types/house";
import { Checkbox } from "@/ui/primitives/Field";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

export function DeleteHouse({
  action,
  kind = "house",
}: {
  action: () => Promise<void>;
  kind?: HouseKind;
}) {
  const houseText = useTranslations("admin.houseForm.delete");
  const furnitureText = useTranslations("admin.furnitureForm.delete");
  const t = kind === "furniture" ? furnitureText : houseText;

  return (
    <section className="mt-16 flex flex-col gap-6 border-2 border-accent p-6">
      <h2 className="label text-accent">{t("title")}</h2>
      <p>{t("warning")}</p>
      <form action={action} className="flex flex-col gap-6">
        <Checkbox label={t("confirm")} name="confirm" required />
        <SubmitButton variant="outline" className="self-start" pendingLabel={t("deleting")}>
          {t("submit")}
        </SubmitButton>
      </form>
    </section>
  );
}