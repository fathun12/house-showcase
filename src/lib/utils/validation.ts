import { z } from "zod";

export const text = (max: number) => z.string().trim().max(max);
export const requiredText = (max: number) => z.string().trim().min(1).max(max);

/** Empty string means "not filled" and becomes null. */
export const optionalNumber = (min: number, max: number, integer = false) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe((integer ? z.number().int() : z.number()).min(min).max(max).nullable());

/** Reads the listed fields of a form as strings. */
export function readFormValues<T extends string>(
  formData: FormData,
  fields: readonly T[],
) {
  return Object.fromEntries(
    fields.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as Record<T, string>;
}

/** First problem per field, as a short code the UI can translate. */
export function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.code;
  }

  return fieldErrors;
}