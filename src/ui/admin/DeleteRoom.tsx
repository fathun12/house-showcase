import { useTranslations } from "next-intl";
import { DangerZone } from "@/ui/admin/DangerZone";

export function DeleteRoom({ action }: { action: () => Promise<void> }) {
  const t = useTranslations("admin.roomForm.delete");

  return (
    <DangerZone
      title={t("title")}
      warning={t("warning")}
      confirm={t("confirm")}
      submit={t("submit")}
      action={action}
    />
  );
}