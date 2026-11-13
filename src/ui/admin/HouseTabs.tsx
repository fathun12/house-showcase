import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { HouseKind } from "@/types/house";

type Tab = "details" | "rooms" | "media" | "models";

const TABS: Record<HouseKind, readonly Tab[]> = {
  house: ["details", "rooms", "media"],
  furniture: ["details", "media", "models"],
};

const BASE: Record<HouseKind, string> = {
  house: "/admin/houses",
  furniture: "/admin/furniture",
};

export function HouseTabs({
  houseId,
  active,
  kind = "house",
}: {
  houseId: string;
  active: Tab;
  kind?: HouseKind;
}) {
  const t = useTranslations("admin.tabs");

  return (
    <nav aria-label={t("label")} className="mb-10 flex w-fit border-2 border-foreground">
      {TABS[kind].map((tab) => (
        <Link
          key={tab}
          href={tab === "details" ? `${BASE[kind]}/${houseId}` : `${BASE[kind]}/${houseId}/${tab}`}
          aria-current={active === tab ? "page" : undefined}
          className={cn(
            "label border-l-2 border-foreground px-5 py-3 transition-colors first:border-l-0",
            active === tab ? "bg-accent text-accent-ink" : "hover:bg-surface",
          )}
        >
          {t(tab)}
        </Link>
      ))}
    </nav>
  );
}