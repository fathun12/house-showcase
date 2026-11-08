import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

type FrameProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function Frame({ label, htmlFor, hint, error, required, children }: FrameProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="label text-muted">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="label text-accent">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const CONTROL = "w-full bg-transparent text-foreground placeholder:text-muted";

// "id" defaults to "name"; pass a different id when the same field appears many times on a page
type FieldExtras = {
  label: string;
  name: string;
  id?: string;
  hint?: string;
  error?: string;
};

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className"> &
  FieldExtras;

export function TextField({
  label,
  name,
  id = name,
  hint,
  error,
  required,
  ...props
}: TextFieldProps) {
  return (
    <Frame label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL,
          "border-b-2 border-foreground py-2 focus:border-accent",
          error && "border-accent",
        )}
        {...props}
      />
    </Frame>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className"> &
  FieldExtras;

export function TextArea({
  label,
  name,
  id = name,
  hint,
  error,
  required,
  ...props
}: TextAreaProps) {
  return (
    <Frame label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL,
          "border-2 border-foreground p-3 focus:border-accent",
          error && "border-accent",
        )}
        {...props}
      />
    </Frame>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "className"> &
  FieldExtras & { options: readonly { value: string; label: string }[] };

export function Select({
  label,
  name,
  id = name,
  hint,
  error,
  required,
  options,
  ...props
}: SelectProps) {
  return (
    <Frame label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL,
          "cursor-pointer border-b-2 border-foreground py-2 focus:border-accent",
          error && "border-accent",
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Frame>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className" | "type"> & {
  label: string;
  name: string;
  id?: string;
  hint?: string;
};

export function Checkbox({ label, name, id = name, hint, ...props }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          id={id}
          name={name}
          className="size-6 shrink-0 cursor-pointer appearance-none border-2 border-foreground checked:border-accent checked:bg-accent"
          {...props}
        />
        <span className="label">{label}</span>
      </label>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}