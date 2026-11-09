import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  title: string;
  tagline: string;
  image: ImageView | null;
};

/** Big inverted box: black in light theme, light in dark theme. Text left, image right. */
export function Hero({ label, title, tagline, image }: Props) {
  return (
    <section className="gutter mx-auto max-w-page py-6 md:py-10">
      <div className={cn("grid bg-foreground text-background", image && "md:grid-cols-12")}>
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
          <p className="intro label flex items-center gap-3 text-background/70">
            <span aria-hidden className="size-2 bg-accent" />
            {label}
          </p>

          <div>
            <h1 className="intro heading text-5xl text-balance [--intro-delay:100ms] sm:text-6xl md:text-7xl lg:text-8xl">
              {title}
            </h1>
            {tagline ? (
              <p className="intro mt-6 max-w-xl text-lg [--intro-delay:200ms] md:text-xl">
                {tagline}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}