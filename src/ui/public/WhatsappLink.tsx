"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import { whatsappHref } from "@/lib/utils/whatsapp";

const subscribe = () => () => {};
// The page address without any #hash. Empty on the server: the link is added in the browser.
const pageUrl = () => window.location.href.split("#")[0];
const noUrl = () => "";

type Props = {
  number: string;
  message: string;
  /** Room anchor (e.g. "room-01"): the link then opens the page at that room */
  anchor?: string;
  label: string;
  className?: string;
};

/** "Comment on WhatsApp": the message carries a link to this page, or to one room of it. */
export function WhatsappLink({ number, message, anchor, label, className }: Props) {
  const url = useSyncExternalStore(subscribe, pageUrl, noUrl);
  const link = url ? (anchor ? `${url}#${anchor}` : url) : "";
  const href = whatsappHref(number, link ? `${message}\n\n${link}` : message);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "label inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline",
        className,
      )}
    >
      {label} ↗
    </a>
  );
}