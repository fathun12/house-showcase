import { getLocale, getTranslations } from "next-intl/server";
import { listHouses } from "@/features/houses/queries";
import { Link } from "@/lib/i18n/navigation";
import { FormShell } from "@/ui/admin/FormShell";
import { ProjectTable } from "@/ui/admin/ProjectTable";
import { buttonStyles } from "@/ui/primitives/Button";

export default async function AdminHousesPage() {
  const t = await getTranslations("admin.houses");
  const locale = await getLocale();
  const houses = await listHouses("house");

  return (
    <FormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      actions={
        <Link href="/admin/houses/new" className={buttonStyles("primary")}>
          {t("new")}
        </Link>
      }
    >
      {houses.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <ProjectTable projects={houses} kind="house" locale={locale} />
      )}
    </FormShell>
  );
}