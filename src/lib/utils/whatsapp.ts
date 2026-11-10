/** Keeps digits only; a leading 0 becomes 62 (Indonesia): 0812... -> 62812... */
export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export function isValidWhatsapp(raw: string): boolean {
  const length = normalizeWhatsapp(raw).length;
  return length >= 9 && length <= 15;
}

/** Builds a wa.me link with a prefilled message, or null when the number is empty or invalid. */
export function whatsappHref(number: string, text: string): string | null {
  if (!isValidWhatsapp(number)) return null;
  return `https://wa.me/${normalizeWhatsapp(number)}?text=${encodeURIComponent(text)}`;
}