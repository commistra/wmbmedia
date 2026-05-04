export const WMB_WHATSAPP_NUMBER_E164 = "6282327922762";

export function getWmbWhatsAppJoinUrl(message?: string) {
  const base = `https://wa.me/${WMB_WHATSAPP_NUMBER_E164}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

