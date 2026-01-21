
export const statusTranslations = {
  "completed": "Tamamlandı",
  "started": "Başladı",
  "pending": "Beklemede",
  "in_progress": "Devam Ediyor",
  "approved": "Onaylandı",
  "rejected": "Reddedildi",
  "draft": "Taslak",
  "submitted": "Gönderildi",
  "revision_requested": "Revizyon İstendi",
  "manufacturing": "Üretim Aşamasında",
  "ready": "Hazır",
  "delivered": "Teslim Edildi",
  "cancelled": "İptal Edildi",
  "on_hold": "Beklemeye Alındı",
  "archived": "Arşivlendi",
  
  // Mixed or existing Turkish statuses to ensure consistency
  "Tasarıma Başlandı": "Tasarıma Başlandı",
  "Üretimde": "Üretimde",
  "Onaylandı": "Onaylandı",
  "Proje Bitti": "Proje Bitti",
  "Revize": "Revize",
  "Teklif Bekliyor": "Teklif Bekliyor",
  "Teklif Verildi": "Teklif Verildi",
  "Çiziliyor": "Çiziliyor",
  "Bekleyenler": "Bekleyenler",
  "Verilenler": "Verilenler"
};

export const translateStatus = (status) => {
  if (!status) return '';
  // Check exact match first
  if (statusTranslations[status]) return statusTranslations[status];
  // Check case-insensitive match
  const lowerStatus = status.toLowerCase();
  const foundKey = Object.keys(statusTranslations).find(key => key.toLowerCase() === lowerStatus);
  return foundKey ? statusTranslations[foundKey] : status;
};

export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (['completed', 'onaylandı', 'delivered', 'ready', 'tamamlandı', 'proje bitti'].includes(s)) return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (['started', 'in_progress', 'çiziliyor', 'tasarıma başlandı', 'başladı', 'devam ediyor'].includes(s)) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (['pending', 'teklif bekliyor', 'beklemede', 'draft', 'taslak'].includes(s)) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (['rejected', 'cancelled', 'reddedildi', 'iptal edildi'].includes(s)) return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (['revision_requested', 'revize', 'revizyon istendi'].includes(s)) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  if (['manufacturing', 'üretimde', 'üretim aşamasında'].includes(s)) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
  return 'bg-zinc-800 text-zinc-400 border-zinc-700';
};
