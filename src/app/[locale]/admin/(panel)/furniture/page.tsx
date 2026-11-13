import { getLocale, getTranslations } from "next-intl/server";
import { listHouses } from "@/features/houses/queries";
import { Link } from "@/lib/i18n/navigation";
import { FormShell } from "@/ui/admin/FormShell";
import { ProjectTable } from "@/ui/admin/ProjectTable";
import { buttonStyles } from "@/ui/primitives/Button";

export default async function AdminFurnitureListPage() {
  const t = await getTranslations("admin.furniture");
  const locale = await getLocale();
  const projects = await listHouses("furniture");

  return (
    <FormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      actions={
        <Link href="/admin/furniture/new" className={buttonStyles("primary")}>
          {t("new")}
        </Link>
      }
    >
      {projects.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <ProjectTable projects={projects} kind="furniture" locale={locale} />
      )}
    </FormShell>
  );
}