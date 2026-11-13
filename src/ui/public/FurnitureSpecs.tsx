import { useTranslations } from "next-intl";
import type { FurnitureContent } from "@/features/furniture/view";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  dimensions: FurnitureContent["dimensions"];
  material: string;
  finish: string;
};

/** The sizes are the point of this section, so they are the biggest thing on it. */
export function FurnitureSpecs({ dimensions, material, finish }: Props) {
  const t = useTranslations("public.furniture.specs");

  const cells = [
    { key: "length", value: dimensions.length },
    { key: "width", value: dimensions.width },
    { key: "height", value: dimensions.height },
  ] as const;

  const hasDimensions = cells.some((cell) => cell.value !== null);

  const rows = [
    material && { label: t("material"), value: material },
    finish && { label: t("finish"), value: finish },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <Reveal className="mt-8">
      {hasDimensions ? (
        <>
          <dl className="grid grid-cols-3 border-y-2 border-foreground">
            {cells.map((cell, index) => (
              <div
                key={cell.key}
                className={cn("px-3 py-6 sm:px-6", index > 0 && "border-l border-foreground")}
              >
                <dt className="label text-muted">{t(cell.key)}</dt>
                <dd className="mt-3 text-4xl leading-none font-light tracking-tight tabular-nums sm:text-6xl md:text-7xl">
                  {cell.value ?? "-"}
                  {cell.value ? (
                    <span className="label mt-2 block text-muted">{t("unit")}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted">{t("note")}</p>
        </>
      ) : null}

      {rows.length > 0 ? (
        <dl className="mt-8 border-t-2 border-foreground">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-b border-foreground py-4 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <dt className="label text-muted sm:w-40 sm:shrink-0">{row.label}</dt>
              <dd className="text-lg whitespace-pre-line">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Reveal>
  );
}