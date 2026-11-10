import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";
import { PresentButton } from "@/ui/public/PresentButton";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";
import { WhatsappLink } from "@/ui/public/WhatsappLink";

type Props = {
  brand: string;
  title: string;
  tagline: string;
  facts: string[];
  image: ImageView | null;
  /** The first section of the page, offered as the obvious next step */
  next: { href: string; label: string } | null;
  /** Comment link to this page, only when a WhatsApp number is set */
  whatsapp: { number: string; message: string; label: string } | null;
  /** Presentation button, only when at least one room has a photo */
  present: { label: string } | null;
  /** "Design by": shown here on small screens only, the desktop side column already has it */
  designer: { label: string; name: string } | null;
};

/** Big inverted box from the very top: black in light theme, light in dark theme. */
export function Hero({
  brand,
  title,
  tagline,
  facts,
  image,
  next,
  whatsapp,
  present,
  designer,
}: Props) {
  return (
    <section className="gutter mx-auto max-w-page pt-6 md:pt-10">
      <div className={cn("rise grid bg-foreground text-background", image && "md:grid-cols-12")}>
        {image ? (
          <figure className="relative aspect-video md:order-2 md:col-span-7 md:aspect-auto md:min-h-160">
            <ViewerTrigger itemKey={image.src} fill>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                priority
                className="object-cover"
              />
            </ViewerTrigger>
            {image.caption ? (
              <figcaption className="label pointer-events-none absolute inset-x-0 bottom-0 bg-foreground/80 px-4 py-2">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div
          className={cn(
            "flex flex-col justify-between gap-16 p-8 md:p-12",
            image && "md:order-1 md:col-span-5",
          )}
        >
          <p className="flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span className="heading text-xl">{brand}</span>
          </p>

          <div>
            <h1
              className={cn(
                "heading text-5xl text-balance sm:text-6xl",
                image ? "md:text-5xl lg:text-6xl" : "md:text-7xl lg:text-8xl",
              )}
            >
              {title}
            </h1>
            {tagline ? (
              <p className="mt-6 max-w-xl text-2xl leading-snug font-light tracking-tight md:text-3xl">
                {tagline}
              </p>
            ) : null}
            {facts.length > 0 ? (
              <p className="label mt-8 border-t border-background/40 pt-4">
                {facts.join(" / ")}
              </p>
            ) : null}
            {designer ? (
              <p className="label mt-3 text-background/60 lg:hidden">
                {designer.label} {designer.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-1">
        {next ? (
          <a
            href={next.href}
            className="label inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
          >
            {next.label} ↓
          </a>
        ) : null}
        {present ? <PresentButton label={present.label} /> : null}
        {whatsapp ? (
          <WhatsappLink
            number={whatsapp.number}
            message={whatsapp.message}
            label={whatsapp.label}
          />
        ) : null}
      </div>
    </section>
  );
}