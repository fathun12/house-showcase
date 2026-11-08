type Item = { id: string; number: string; label: string };

/** Numbered links to the page sections: a sticky bar on phones, a sticky column on desktop. */
export function SectionIndex({ label, items }: { label: string; items: Item[] }) {
  return (
    <nav
      aria-label={label}
      className="sticky top-0 z-10 -mx-[var(--gutter)] overflow-x-auto border-b-2 border-foreground bg-background px-[var(--gutter)] lg:top-8 lg:z-0 lg:mx-0 lg:self-start lg:overflow-visible lg:border-b-0 lg:px-0"
    >
      <ul className="flex lg:flex-col lg:border-t-2 lg:border-foreground">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="label flex gap-2 px-4 py-3 whitespace-nowrap hover:bg-surface lg:border-b lg:border-foreground lg:px-0"
            >
              <span className="text-accent">{item.number}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}