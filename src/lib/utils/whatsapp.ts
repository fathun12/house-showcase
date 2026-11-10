/** Builds a wa.me link with a prefilled message, or null when no number is set. */
export function whatsappHref(text: string): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  if (number.length < 8) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}