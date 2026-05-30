export const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "15072617770").replace(/\D/g, "");
export const whatsappDisplay = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "+1 507 261 7770";

export function whatsappHref(message?: string) {
  const baseUrl = `https://wa.me/${whatsappNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
