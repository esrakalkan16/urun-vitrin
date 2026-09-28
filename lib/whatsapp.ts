export function buildWhatsAppLink(phone: string | null | undefined, message: string): string | null {
  if (!phone || !phone.trim()) {
    return null;
  }

  let cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return null;
  }

  // Türkiye numarası formatı düzenleme (10 ve 11 haneliler için)
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    cleaned = '90' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('05')) {
    cleaned = '90' + cleaned.substring(1);
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}
