import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type Tab = "details" | "rooms" | "media";

export function HouseTabs({ houseId, active }: { houseId: string; active: Tab }) {
  const t = useTranslations("admin.tabs");

  const tabs: { key: Tab; href: string }[] = [
    { key: "details", href: `/admin/houses/${houseId}` },
    { key: "rooms", href: `/admin/houses/${houseId}/rooms` },
    { key: "media", href: `/admin/houses/${houseId}/media` },
  ];

  return (
    <nav aria-label={t("label")} className="mb-10 flex w-fit border-2 border-foreground">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={cn(
            "label border-l-2 border-foreground px-5 py-3 transition-colors first:border-l-0",
            active === tab.key
              ? "bg-accent text-accent-ink"
              : "hover:bg-surface",
          )}
        >
          {t(tab.key)}
        </Link>
      ))}
    </nav>
  );
}