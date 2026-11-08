import { createBrowserClient } from "@supabase/ssr";

/** Browser-side client. Used for image upload from the admin dashboard. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}