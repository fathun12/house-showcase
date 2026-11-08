import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

type FrameProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function Frame({ label, name, hint, error, required, children }: FrameProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="label text-muted">
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

type FieldExtras = { label: string; name: string; hint?: string; error?: string };

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className"> &
  FieldExtras;

export function TextField({ label, name, hint, error, required, ...props }: TextFieldProps) {
  return (
    <Frame label={label} name={name} hint={hint} error={error} required={required}>
      <input
        id={name}
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

export function TextArea({ label, name, hint, error, required, ...props }: TextAreaProps) {
  return (
    <Frame label={label} name={name} hint={hint} error={error} required={required}>
      <textarea
        id={name}
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

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className" | "type"> & {
  label: string;
  name: string;
  hint?: string;
};

export function Checkbox({ label, name, hint, ...props }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          id={name}
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