import { TextArea, TextField } from "@/ui/primitives/Field";

type Props = {
  label: string;
  /** Base name: "title" renders the fields title_id and title_en */
  name: string;
  defaults: { id: string; en: string };
  errors: { id?: string; en?: string };
  multiline?: boolean;
  rows?: number;
  /** Only the Indonesian side is required, English falls back to it */
  required?: boolean;
};

export function BilingualField({
  label,
  name,
  defaults,
  errors,
  multiline,
  rows = 5,
  required,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {(["id", "en"] as const).map((lang) => {
        const props = {
          label: `${label} / ${lang.toUpperCase()}`,
          name: `${name}_${lang}`,
          defaultValue: defaults[lang],
          error: errors[lang],
          required: required && lang === "id",
        };

        return multiline ? (
          <TextArea key={lang} rows={rows} {...props} />
        ) : (
          <TextField key={lang} {...props} />
        );
      })}
    </div>
  );
}