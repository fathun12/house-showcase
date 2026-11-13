"use client";

import { useEffect, useRef } from "react";
import type { RoomView } from "@/features/houses/view";
import { useActiveSection } from "@/features/nav/useActiveSection";

type Item = { id: string; number: string; label: string };

type Props = {
  label: string;
  items: Item[];
  /** Rooms are listed under the "rooms" item, on desktop only */
  rooms: Pick<RoomView, "anchor" | "number" | "name">[];
  /** House numbers and the designer's name, under the index, on desktop only */
  specs: {
    title: string;
    rows: { label: string; value: string }[];
    designByLabel: string;
    designer: string;
  };
};

/** The marker of the section being read: a terracotta bar on the left edge of the
 *  link on desktop, a bar under the link on phones. It grows in when it becomes active. */
const marker =
  "relative before:absolute before:left-0 before:bottom-0 before:h-1 before:w-full before:origin-left before:scale-x-0 before:bg-accent before:transition-transform motion-reduce:before:transition-none aria-[current=true]:before:scale-x-100 " +
  "lg:before:top-0 lg:before:h-auto lg:before:w-1 lg:before:origin-top lg:before:scale-x-100 lg:before:scale-y-0 lg:aria-[current=true]:before:scale-y-100";

/** Numbered links to the page sections: a sticky bar on phones, a sticky column on desktop.
 *  On desktop the rooms sit under "Rooms", so every room is one click away while scrolling. */
export function SectionIndex({ label, items, rooms, specs }: Props) {
  const activeSection = useActiveSection(items.map((item) => item.id));
  const passedRoom = useActiveSection(rooms.map((room) => room.anchor));
  const activeRoom = activeSection === "rooms" ? passedRoom : null;

  const navRef = useRef<HTMLElement>(null);

  // On phones the row scrolls sideways: keep the active link in view
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('a[data-section][aria-current="true"]');
    if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return;

    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeSection]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="sticky top-0 z-10 -mx-(--gutter) overflow-x-auto border-b-2 border-foreground bg-background gutter lg:top-8 lg:z-0 lg:mx-0 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-x-visible lg:overflow-y-auto lg:border-b-0 lg:px-0"
    >
      <ul className="flex lg:flex-col lg:border-t-2 lg:border-foreground">
        {items.map((item) => (
          <li key={item.id} className="shrink-0 lg:border-b lg:border-foreground">
            <a
              href={`#${item.id}`}
              data-section
              aria-current={item.id === activeSection ? "true" : undefined}
              className={`${marker} label flex min-h-11 items-center gap-2 px-4 whitespace-nowrap hover:bg-surface focus-visible:-outline-offset-2 lg:pr-0`}
            >
              <span className="text-accent">{item.number}</span>
              <span>{item.label}</span>
            </a>

            {item.id === "rooms" && rooms.length > 0 ? (
              <ol className="hidden pb-2 lg:block">
                {rooms.map((room) => (
                  <li key={room.anchor}>
                    <a
                      href={`#${room.anchor}`}
                      aria-current={room.anchor === activeRoom ? "true" : undefined}
                      className="label flex items-baseline gap-2 py-1.5 pl-8 text-muted hover:text-accent focus-visible:-outline-offset-2 aria-current:text-foreground"
                    >
                      <span className="text-accent">{room.number}</span>
                      <span>{room.name}</span>
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ul>

      {specs.rows.length > 0 || specs.designer ? (
        <div className="mt-10 hidden pb-2 lg:block">
          {specs.rows.length > 0 ? (
            <>
              <p className="label text-accent">{specs.title}</p>
              <dl className="mt-3 border-t-2 border-foreground">
                {specs.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-b border-foreground py-2.5"
                  >
                    <dt className="label text-muted">{row.label}</dt>
                    <dd className="label">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}

          {specs.designer ? (
            <p className="label mt-5 text-muted">
              {specs.designByLabel} <span className="text-foreground">{specs.designer}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}