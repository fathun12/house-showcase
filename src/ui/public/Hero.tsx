import Image from "next/image";
import type { ImageView } from "@/features/houses/view";

type Props = {
  label: string;
  title: string;
  tagline: string;
  image: ImageView | null;
};

export function Hero({ label, title, tagline, image }: Props) {
  return (
    <section>
      {image ? (
        <figure className="border-b-2 border-foreground">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
            priority
            className="aspect-video max-h-[85dvh] w-full object-cover"
          />
          {image.caption ? (
            <figcaption className="label gutter mx-auto max-w-page py-3 text-muted">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div className="gutter mx-auto grid max-w-page gap-6 py-10 md:grid-cols-[1fr_24rem] md:items-end md:gap-12 md:py-14">
        <div>
          <p className="label text-accent">{label}</p>
          <h1 className="heading mt-4 text-5xl text-balance sm:text-7xl md:text-8xl">
            {title}
          </h1>
        </div>
        {tagline ? <p className="text-lg md:text-xl">{tagline}</p> : null}
      </div>
    </section>
  );
}