
/**
 * Mock Service for Gemini AI integration
 * Simulates AI responses for chat and title generation
 * Handles errors gracefully to prevent app crashes
 */

import { wait } from '@/lib/networkUtils';

export const getGeminiChat = async (message, history = []) => {
  // Guard clause for empty messages
  if (!message || typeof message !== 'string') {
    console.warn('GeminiService: Empty message received');
    return {
      text: "Lütfen geçerli bir mesaj girin.",
      role: 'ai',
      timestamp: new Date().toISOString()
    };
  }

  try {
    console.log("Gemini AI processing:", message);
    
    // Simulate network delay
    await wait(1000);

    const lowerMsg = message.toLowerCase();
    let responseText = "Size proje yönetimi, fuar takvimi veya tasarım fikirleri konusunda yardımcı olabilirim. Nasıl destek olabilirim?";

    if (lowerMsg.includes('fikir') || lowerMsg.includes('tasarım') || lowerMsg.includes('design')) {
      responseText = "Mevcut fuar trendlerine dayanarak, sürdürülebilir malzemeler ve interaktif LED duvarlar içeren açık konseptli standlar çok popüler. Sizin için bir konsept taslağı oluşturmamı ister misiniz?";
    } else if (lowerMsg.includes('zaman') || lowerMsg.includes('takvim') || lowerMsg.includes('schedule')) {
      responseText = "Fuar Takvimini kontrol ettim. Önümüzdeki en yakın büyük etkinlik önümüzdeki ay İstanbul'da. Üretim planlamasını hemen yapmalıyız.";
    } else if (lowerMsg.includes('risk') || lowerMsg.includes('analiz')) {
      responseText = "Risk analizi yapıyorum... Lojistik sürelerinde potansiyel bir gecikme riski tespit ettim. Nakliye planını 2 gün öne çekmenizi öneririm.";
    } else if (lowerMsg.includes('merhaba') || lowerMsg.includes('selam')) {
       responseText = "Merhaba! Projenic asistanınız olarak bugün size nasıl yardımcı olabilirim?";
    }

    return {
      text: responseText,
      role: 'ai',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('GeminiService Error:', error);
    return {
      text: "Şu anda bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.",
      role: 'ai',
      timestamp: new Date().toISOString(),
      error: true
    };
  }
};

export const generateTitle = async (description) => {
  if (!description) return "Yeni Proje";
  
  try {
    await wait(500);
    // Simple mock logic for title generation
    const words = description.split(' ');
    if (words.length > 0) {
        return `Proje: ${words.slice(0, 3).join(' ')}...`;
    }
    return "Yeni Proje Taslağı";
  } catch (e) {
    console.error('Title generation failed:', e);
    return "İsimsiz Proje";
  }
};

// Main export object
const geminiService = {
  getGeminiChat,
  generateTitle
};

export default geminiService;
