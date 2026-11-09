import type { RoomView } from "@/features/houses/view";

type Item = { id: string; number: string; label: string };

type Props = {
  label: string;
  items: Item[];
  /** Rooms are listed under the "rooms" item, on desktop only */
  rooms: Pick<RoomView, "anchor" | "number" | "name">[];
};

/** Numbered links to the page sections: a sticky bar on phones, a sticky column on desktop.
 *  On desktop the rooms sit under "Rooms", so every room is one click away while scrolling. */
export function SectionIndex({ label, items, rooms }: Props) {
  return (
    <nav
      aria-label={label}
      className="sticky top-0 z-10 -mx-[var(--gutter)] overflow-x-auto border-b-2 border-foreground bg-background px-[var(--gutter)] lg:top-8 lg:z-0 lg:mx-0 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-x-visible lg:overflow-y-auto lg:border-b-0 lg:px-0"
    >
      <ul className="flex lg:flex-col lg:border-t-2 lg:border-foreground">
        {items.map((item) => (
          <li key={item.id} className="shrink-0 lg:border-b lg:border-foreground">
            <a
              href={`#${item.id}`}
              className="label flex min-h-11 items-center gap-2 px-4 whitespace-nowrap hover:bg-surface focus-visible:-outline-offset-2 lg:px-0"
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
                      className="label flex items-baseline gap-2 py-1.5 pl-6 text-muted hover:text-accent focus-visible:-outline-offset-2"
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
    </nav>
  );
}