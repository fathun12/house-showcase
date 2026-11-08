import { cn } from "@/lib/utils/cn";
import { SectionTitle } from "@/ui/public/SectionTitle";

type Props = {
  id: string;
  number: string;
  title: string;
  body: string;
  /** Draws a terracotta frame around the text, for the notes that need attention */
  emphasis?: boolean;
};

export function Notes({ id, number, title, body, emphasis }: Props) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t-2 border-foreground py-12 first:border-t-0"
    >
      <SectionTitle number={number}>{title}</SectionTitle>
      <div
        className={cn(
          "mt-8 max-w-3xl text-lg leading-relaxed whitespace-pre-line md:text-xl",
          emphasis && "border-2 border-accent p-6",
        )}
      >
        {body}
      </div>
    </section>
  );
}