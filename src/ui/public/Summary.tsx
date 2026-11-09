type Item = { label: string; value: string };

/** One ruled box of key numbers, like the title block of a drawing sheet. */
export function Summary({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <section className="gutter mx-auto max-w-page pb-6 md:pb-10">
      <dl className="grid grid-cols-2 border-2 border-foreground md:auto-cols-fr md:grid-flow-col">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-foreground p-5 odd:border-r-2 [&:nth-child(n+3)]:border-t-2 md:border-r-2 md:px-8 md:py-6 md:last:border-r-0 md:[&:nth-child(n+3)]:border-t-0"
          >
            <dt className="label text-muted">{item.label}</dt>
            <dd className="heading mt-2 text-5xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}