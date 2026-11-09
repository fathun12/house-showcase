type Item = { id: string; number: string; label: string };

/** One thin horizontal row of numbered section links, on phones and desktop alike.
 *  It sticks to the top of the screen while scrolling. */
export function SectionIndex({ label, items }: { label: string; items: Item[] }) {
  return (
    <nav aria-label={label} className="sticky top-0 z-10 bg-background">
      <div className="gutter mx-auto max-w-page">
        <div className="border-b-2 border-foreground">
          {/* The list scrolls sideways on small screens and bleeds into the gutter,
              while the first link keeps the same left edge as the rest of the page */}
          <ul className="-mx-[var(--gutter)] flex overflow-x-auto px-[var(--gutter)]">
            {items.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className="label flex min-h-11 items-center gap-2 pr-6 whitespace-nowrap hover:text-accent focus-visible:-outline-offset-2"
                >
                  <span className="text-accent">{item.number}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}