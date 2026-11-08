"use client";

import { useTranslations } from "next-intl";
import { useLoginForm } from "@/features/auth/useLoginForm";
import { Button } from "@/ui/primitives/Button";
import { TextField } from "@/ui/primitives/Field";

export function LoginForm() {
  const t = useTranslations("auth");
  const { error, email, formAction, isPending } = useLoginForm();

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-8">
      <TextField
        label={t("email")}
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={email}
        required
      />
      <TextField
        label={t("password")}
        name="password"
        type="password"
        autoComplete="current-password"
        error={error ? t("invalid") : undefined}
        required
      />
      <Button type="submit" disabled={isPending} className="self-start">
        {t("submit")}
      </Button>
    </form>
  );
}