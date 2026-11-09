import type { ReactNode } from "react";

export function SectionTitle({
  number,
  as: Tag = "h2",
  children,
}: {
  number?: string;
  as?: "h1" | "h2";
  children: ReactNode;
}) {
  return (
    <Tag className="reveal flex flex-wrap items-baseline gap-x-4">
      {number ? <span className="label text-accent">{number}</span> : null}
      <span className="heading text-4xl md:text-5xl">{children}</span>
    </Tag>
  );
}