/**
 * Generate a WhatsApp click-to-chat URL for an Indian 10-digit mobile number.
 */
export function waToCustomer(phone10: string, text: string): string {
  const cleanPhone = phone10.replace(/\D/g, "").slice(-10);
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
}
