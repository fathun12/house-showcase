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
    <Tag className="reveal">
      {number ? <span className="label block text-accent">{number}</span> : null}
      <span className="heading mt-3 block text-4xl text-balance md:text-5xl">{children}</span>
    </Tag>
  );
}