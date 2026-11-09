import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";

type Props = {
  brand: string;
  title: string;
  tagline: string;
  facts: string[];
  image: ImageView | null;
  /** The first section of the page, offered as the obvious next step */
  next: { href: string; label: string } | null;
};

/** Big inverted box from the very top: black in light theme, light in dark theme. */
export function Hero({ brand, title, tagline, facts, image, next }: Props) {
  return (
    <section className="gutter mx-auto max-w-page pt-6 md:pt-10">
      <div className={cn("rise grid bg-foreground text-background", image && "md:grid-cols-12")}>
        {image ? (
          <figure className="relative aspect-video md:order-2 md:col-span-5 md:aspect-auto md:min-h-[32rem]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              priority
              className="object-cover"
            />
            {image.caption ? (
              <figcaption className="label absolute inset-x-0 bottom-0 bg-foreground/80 px-4 py-2">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div
          className={cn(
            "flex flex-col justify-between gap-16 p-8 md:p-12",
            image && "md:order-1 md:col-span-7",
          )}
        >
          <p className="flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span className="heading text-xl">{brand}</span>
          </p>

          <div>
            <h1 className="heading text-5xl text-balance sm:text-6xl md:text-7xl lg:text-8xl">
              {title}
            </h1>
            {tagline ? <p className="mt-6 max-w-xl text-lg md:text-xl">{tagline}</p> : null}
            {facts.length > 0 ? (
              <p className="label mt-8 border-t border-background/40 pt-4">
                {facts.join(" / ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {next ? (
        <a
          href={next.href}
          className="label mt-4 inline-block text-accent underline-offset-4 hover:underline"
        >
          {next.label} ↓
        </a>
      ) : null}
    </section>
  );
}