import { getLocale, getTranslations } from "next-intl/server";
import { listHouses } from "@/features/houses/queries";
import { Link } from "@/lib/i18n/navigation";
import { formatDate } from "@/lib/utils/format";
import { FormShell } from "@/ui/admin/FormShell";
import { buttonStyles } from "@/ui/primitives/Button";
import { Table, Td, Th } from "@/ui/primitives/Table";
import { Tag } from "@/ui/primitives/Tag";

export default async function AdminHousesPage() {
  const t = await getTranslations("admin.houses");
  const locale = await getLocale();
  const houses = await listHouses();

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
        <Table>
          <thead>
            <tr>
              <Th>{t("columns.title")}</Th>
              <Th>{t("columns.slug")}</Th>
              <Th>{t("columns.status")}</Th>
              <Th>{t("columns.updated")}</Th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => (
              <tr key={house.id}>
                <Td>
                  <Link
                    href={`/admin/houses/${house.id}`}
                    className="font-bold underline underline-offset-4 hover:text-accent"
                  >
                    {locale === "en" && house.title_en
                      ? house.title_en
                      : house.title_id}
                  </Link>
                </Td>
                <Td className="font-mono text-sm">{house.slug}</Td>
                <Td>
                  <Tag tone={house.is_published ? "accent" : "outline"}>
                    {house.is_published ? t("published") : t("draft")}
                  </Tag>
                </Td>
                <Td className="font-mono text-sm">
                  {formatDate(house.updated_at, locale)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </FormShell>
  );
}