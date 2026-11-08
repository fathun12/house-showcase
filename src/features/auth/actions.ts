"use server";

import { createClient } from "@/lib/supabase/server";
import { redirectLocalized } from "./session";

export type LoginState = {
  error: "invalid" | null;
  email: string;
};

export async function signIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "invalid", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "invalid", email };
  }

  return redirectLocalized("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await redirectLocalized("/admin/login");
}