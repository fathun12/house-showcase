import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  id: string;
  number: string;
  title: string;
  body: string;
  /** The black box (architect's voice). Without it: the open statement layout. */
  emphasis?: boolean;
  /** One mono line at the foot of the black box */
  signature?: string;
};

const LEAD_MAX = 220;

/** First sentence as a big statement, the rest as a normal paragraph. */
function splitLead(body: string) {
  const match = body.trim().match(/^([\s\S]+?[.!?])(?=\s|$)\s*([\s\S]*)$/);
  if (!match || match[1].length > LEAD_MAX) return { lead: "", rest: body };
  return { lead: match[1], rest: match[2] };
}

export function Notes({ id, number, title, body, emphasis = false, signature }: Props) {
  if (emphasis) {
    return (
      <section id={id} className="scroll-mt-20 py-12">
        <Reveal kind="fade" className="bg-foreground p-8 text-background md:p-12">
          <h2 className="label flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span>
              {number} / {title}
            </span>
          </h2>
          <p className="mt-10 max-w-[48ch] text-2xl leading-snug font-light tracking-tight whitespace-pre-line md:text-3xl">
            {body}
          </p>
          {signature ? (
            <p className="label mt-12 border-t border-background/40 pt-4">{signature}</p>
          ) : null}
        </Reveal>
      </section>
    );
  }

  const { lead, rest } = splitLead(body);

  return (
    <section id={id} className="scroll-mt-20 border-t-2 border-foreground py-12">
      <Reveal className="grid gap-6 md:grid-cols-[10rem_1fr] md:gap-8">
        <h2 className="label text-accent">
          {number} / {title}
        </h2>
        <div>
          {lead ? (
            <p className="max-w-[28ch] text-3xl leading-tight font-light tracking-tight md:text-4xl">
              {lead}
            </p>
          ) : null}
          {rest ? (
            <p
              className={`max-w-[60ch] text-lg whitespace-pre-line ${lead ? "mt-8" : ""}`}
            >
              {rest}
            </p>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}