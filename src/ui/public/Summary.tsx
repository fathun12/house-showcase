type Item = { label: string; value: string };

/** One ruled row of key numbers, like the title block of a drawing sheet. */
export function Summary({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t-2 border-foreground md:border-b-2">
      <dl className="grid grid-cols-2 md:auto-cols-fr md:grid-flow-col">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-b-2 border-foreground p-5 odd:border-r-2 md:border-r-2 md:border-b-0 md:px-8 md:py-6 md:last:border-r-0"
          >
            <dt className="label text-muted">{item.label}</dt>
            <dd className="heading mt-2 text-5xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}