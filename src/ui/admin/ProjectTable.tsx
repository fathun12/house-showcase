import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { formatDate } from "@/lib/utils/format";
import type { HouseKind, HouseListItem } from "@/types/house";
import { Table, Td, Th } from "@/ui/primitives/Table";
import { Tag } from "@/ui/primitives/Tag";

const BASE: Record<HouseKind, string> = {
  house: "/admin/houses",
  furniture: "/admin/furniture",
};

/** List of projects of one kind, shared by the house and furniture admin pages. */
export function ProjectTable({
  projects,
  kind,
  locale,
}: {
  projects: HouseListItem[];
  kind: HouseKind;
  locale: string;
}) {
  const t = useTranslations("admin.houses");

  return (
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
        {projects.map((project) => (
          <tr key={project.id}>
            <Td>
              <Link
                href={`${BASE[kind]}/${project.id}`}
                className="font-bold underline underline-offset-4 hover:text-accent"
              >
                {locale === "en" && project.title_en ? project.title_en : project.title_id}
              </Link>
            </Td>
            <Td className="font-mono text-sm">{project.slug}</Td>
            <Td>
              <Tag tone={project.is_published ? "accent" : "outline"}>
                {project.is_published ? t("published") : t("draft")}
              </Tag>
            </Td>
            <Td className="font-mono text-sm">{formatDate(project.updated_at, locale)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}