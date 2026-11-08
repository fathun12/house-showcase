import { getLocale } from "next-intl/server";
import type { Locale } from "@/features/locale/options";
import { redirect } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

/** Redirect to a path of the site, keeping the visitor's current language. */
export async function redirectLocalized(href: string): Promise<never> {
  const locale = (await getLocale()) as Locale;
  return redirect({ href, locale });
}

/** The logged-in user, verified with Supabase, or null. */
export async function getAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Use at the top of admin pages and actions: sends strangers to the login page. */
export async function requireAdmin() {
  const user = await getAdmin();

  if (!user) {
    return redirectLocalized("/admin/login");
  }

  return user;
}