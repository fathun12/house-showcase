import type { ReactNode } from "react";

/** Frame of every admin page: small label, big title, optional actions. */
export function FormShell({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-page">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-foreground pb-6">
        <div>
          <p className="label text-accent">{eyebrow}</p>
          <h1 className="heading mt-3 text-5xl">{title}</h1>
        </div>
        {actions}
      </header>
      <div className="mt-10">{children}</div>
    </div>
  );
}

/** Numbered block inside a form, like a drawing sheet label. */
export function FormSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-foreground pt-6 md:grid-cols-[12rem_1fr]">
      <h2 className="label">
        <span className="text-accent">{index}</span> / {title}
      </h2>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}