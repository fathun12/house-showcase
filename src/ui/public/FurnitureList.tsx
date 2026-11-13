import { useTranslations } from "next-intl";
import type { FurnitureRow } from "@/features/furniture/view";
import { Link } from "@/lib/i18n/navigation";
import { SectionTitle } from "@/ui/public/SectionTitle";
import { Table, Td, Th } from "@/ui/primitives/Table";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  rows: FurnitureRow[];
  /** "h1" when this is the first thing on the page */
  as?: "h1" | "h2";
};

export function FurnitureList({ rows, as = "h2" }: Props) {
  const t = useTranslations("public.furniture.index");

  return (
    <section id="furniture-list" className="group scroll-mt-20 pb-12">
      <SectionTitle as={as}>{t("title")}</SectionTitle>

      <Reveal className="mt-8">
        <Table>
          <thead>
            <tr>
              <Th>{t("name")}</Th>
              <Th>{t("size")}</Th>
              <Th>{t("material")}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <Td>
                  <Link
                    href={`/furniture/${row.slug}`}
                    className="heading text-2xl underline-offset-4 hover:text-accent hover:underline"
                  >
                    {row.title}
                  </Link>
                </Td>
                <Td className="font-mono">{row.size ?? "-"}</Td>
                <Td>{row.material || "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Reveal>
    </section>
  );
}