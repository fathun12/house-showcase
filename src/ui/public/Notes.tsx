import { cn } from "@/lib/utils/cn";
import { SectionTitle } from "@/ui/public/SectionTitle";
import { Reveal } from "@/ui/shared/Reveal";

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
    <section id={id} className="group scroll-mt-20 pb-12">
      <SectionTitle number={number}>{title}</SectionTitle>
      <Reveal
        className={cn(
          "mt-8 max-w-3xl text-lg leading-relaxed whitespace-pre-line md:text-xl",
          emphasis && "border-2 border-accent p-6",
        )}
      >
        {body}
      </Reveal>
    </section>
  );
}