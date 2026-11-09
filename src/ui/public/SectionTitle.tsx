import type { ReactNode } from "react";
import { Reveal } from "@/ui/shared/Reveal";

/** Opens a page section: a 2 px line that draws itself, then the number and title.
 *  The parent <section> must have the "group" class so the first section can skip its line. */
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
    <>
      <Reveal aria-hidden kind="line" className="h-0.5 bg-foreground group-first:hidden" />
      <Reveal delay={100} className="pt-12">
        <Tag>
          {number ? <span className="label block text-accent">{number}</span> : null}
          <span className="heading mt-3 block text-4xl text-balance md:text-5xl">{children}</span>
        </Tag>
      </Reveal>
    </>
  );
}