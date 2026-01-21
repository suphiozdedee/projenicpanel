import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function ManualDataImportTab({ onDataParsed }) {
  const [content, setContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen analiz edilecek içeriği yapıştırın."
      });
      return;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-fair-participants', {
        body: { content: content }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Ayrıştırma işlemi başarısız oldu.");
      }

      if (!data.data || data.data.length === 0) {
        toast({
            variant: "warning",
            title: "Veri Bulunamadı",
            description: "İçerikte uygun formatta firma bilgisi tespit edilemedi."
        });
        return;
      }

      toast({
        title: "İşlem Başarılı",
        description: `${data.data.length} adet firma bilgisi başarıyla ayıklandı.`,
        className: "bg-green-500/10 border-green-500 text-green-500"
      });

      onDataParsed(data.data);
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veri ayıklanırken bir hata oluştu: " + error.message
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="glass-card bg-zinc-900/40 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-[#FF6200]" />
          Manuel Veri Girişi ve AI Analizi
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Fuar web sitesinden kopyaladığınız ham metni veya HTML kodunu buraya yapıştırın. Yapay zeka sizin için firma bilgilerini ayıklasın.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder="Buraya web sitesinden kopyaladığınız metni (CTRL+A, CTRL+C) veya HTML kaynağını yapıştırın..." 
          className="min-h-[300px] font-mono text-sm bg-zinc-950/50 border-zinc-800 text-zinc-300 focus:border-[#FF6200] resize-y"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="flex justify-end">
          <Button 
            onClick={handleParse} 
            disabled={isParsing || !content.trim()}
            className="bg-[#FF6200] hover:bg-[#FF8000] text-white"
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yapay Zeka Analiz Ediyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                İçeriği Analiz Et ve Tabloya Dönüştür
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 mt-2">
            <p className="text-zinc-400 text-xs flex gap-2">
                <span className="font-bold text-blue-400">İpucu:</span>
                Sayfadaki karmaşık yapılar, tablolar veya listeler otomatik olarak tanınır. En iyi sonuç için ilgili bölümü seçip kopyalamanız yeterlidir.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}