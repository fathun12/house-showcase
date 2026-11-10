"use client";

import { useTranslations } from "next-intl";
import { signOut } from "@/features/auth/actions";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/ui/primitives/Button";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

const NAV = [{ href: "/admin/houses", key: "houses" }] as const;

export function Sidebar() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-8 border-b-2 border-foreground p-6 md:min-h-dvh md:border-r-2 md:border-b-0">
      <div>
        <p className="label text-accent">Admin</p>
        <p className="heading mt-2 text-2xl">House Showcase</p>
      </div>

      <nav aria-label={t("label")}>
        <ul className="flex flex-col border-t border-foreground">
          {NAV.map((item, index) => {
            const active = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "label flex gap-2 border-b border-foreground px-3 py-3 transition-colors",
                    active ? "bg-accent text-accent-ink" : "hover:bg-surface",
                  )}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>/ {t(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col items-start gap-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="label underline underline-offset-4 hover:text-accent"
        >
          {t("viewSite")} →
        </Link>
        <ThemeSwitch />
        <LocaleSwitch />
        <form action={signOut} className="w-full">
          <Button type="submit" variant="outline" className="w-full">
            {t("signOut")}
          </Button>
        </form>
      </div>
    </aside>
  );
}