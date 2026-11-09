import { useTranslations } from "next-intl";
import type { SummaryRow } from "@/features/houses/view";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { SectionTitle } from "@/ui/public/SectionTitle";
import { Table, Td, Th } from "@/ui/primitives/Table";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  rows: SummaryRow[];
  /** "h1" when this is the whole page (home with several houses) */
  as?: "h1" | "h2";
  number?: string;
  currentSlug?: string;
};

export function Compare({ rows, as = "h2", number, currentSlug }: Props) {
  const t = useTranslations("public");

  if (rows.length === 0) {
    return (
      <section className="border-2 border-foreground p-8">
        <h1 className="heading text-4xl">{t("empty.title")}</h1>
        <p className="mt-3 text-muted">{t("empty.text")}</p>
      </section>
    );
  }

  return (
    <section id="compare" className="group scroll-mt-20 pb-12">
      <SectionTitle as={as} number={number}>
        {as === "h1" ? t("compare.indexTitle") : t("compare.title")}
      </SectionTitle>

      <Reveal className="mt-8">
        <Table>
          <thead>
            <tr>
              <Th>{t("compare.house")}</Th>
              <Th>{t("summary.floors")}</Th>
              <Th>{t("summary.bedrooms")}</Th>
              <Th>{t("summary.bathrooms")}</Th>
              <Th>{t("summary.area")}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.slug}
                aria-current={row.slug === currentSlug ? "true" : undefined}
                className={cn(row.slug === currentSlug && "bg-surface")}
              >
                <Td>
                  <Link
                    href={`/house/${row.slug}`}
                    className="heading text-2xl underline-offset-4 hover:text-accent hover:underline"
                  >
                    {row.title}
                  </Link>
                </Td>
                <Td className="font-mono">{row.floors ?? "-"}</Td>
                <Td className="font-mono">{row.bedrooms ?? "-"}</Td>
                <Td className="font-mono">{row.bathrooms ?? "-"}</Td>
                <Td className="font-mono">{row.area ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Reveal>
    </section>
  );
}