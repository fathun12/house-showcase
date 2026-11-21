import { createClient } from "@supabase/supabase-js";

/** Full-access client (secret key). Only for server code that checks the caller itself first.
 *  Today that is one place: redeeming a download token. Never import this in a component. */
export function createSecretClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}