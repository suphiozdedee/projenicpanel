
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2, AlertCircle, Link as LinkIcon, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { exportCustomersToExcel } from '@/lib/excelExport';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { safeQuery } from '@/lib/networkUtils';

const FairWebScraperTab = () => {
    const { toast } = useToast();
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [scrapedData, setScrapedData] = useState(null);
    const [scrapeError, setScrapeError] = useState(null);

    const validateUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleScrape = async () => {
        setScrapeError(null);
        setScrapedData(null);

        if (!scrapeUrl) {
            setScrapeError("Lütfen bir URL giriniz.");
            return;
        }

        if (!validateUrl(scrapeUrl)) {
            setScrapeError("Geçersiz URL formatı. Lütfen http:// veya https:// ile başlayan tam adresi giriniz.");
            return;
        }

        setIsScraping(true);

        try {
            // Using safeQuery for the edge function call
            const { data, error } = await safeQuery(
                () => supabase.functions.invoke('scrape-fair-participants', {
                    body: { url: scrapeUrl }
                }),
                { 
                    timeoutMs: 60000, // Longer timeout for scraping
                    errorMessage: 'Tarama işlemi sırasında bir hata oluştu.',
                    errorTitle: 'Tarama Hatası'
                }
            );

            if (error) throw error;
            if (!data.success) throw new Error(data.error || "Beklenmeyen hata.");

            if (!data.data || data.data.length === 0) {
                setScrapeError("Sayfa tarandı ancak geçerli katılımcı verisi bulunamadı. URL'nin doğru olduğundan (örn. istanbulfurniturefair.com/tr/markalar) emin olun.");
            } else {
                setScrapedData(data.data);
                toast({
                    title: "Tarama Başarılı!",
                    description: `${data.data.length} adet firma bulundu. (${data.meta?.details_fetched || 0} detay sayfası gezildi)`,
                    className: "bg-green-500/10 border-green-500 text-green-500"
                });
            }

        } catch (error) {
            console.error("Scraping error:", error);
            setScrapeError("Site taranırken bir hata oluştu: " + (error.message || "Bilinmeyen hata."));
        } finally {
            setIsScraping(false);
        }
    };

    const handleDownload = () => {
        if (!scrapedData) return;
        try {
            const urlHost = new URL(scrapeUrl).hostname.replace('www.', '').split('.')[0];
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `${urlHost}_listesi_${dateStr}`;
            
            exportCustomersToExcel(scrapedData, filename);
            
            toast({
                title: "İndiriliyor",
                description: "Excel dosyası oluşturuldu.",
                className: "bg-green-500/10 border-green-500 text-green-500"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Excel oluşturulamadı: " + error.message
            });
        }
    };

    return (
        <Card className="glass-card bg-zinc-900/40 border-zinc-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-[#FF6200]" />
                    Web Scraping (Otomatik Veri Çekme)
                </CardTitle>
                <CardDescription className="text-zinc-500">
                    Fuar web sitelerinin katılımcı listelerini tarayarak firma detaylarını (Telefon, Email, Adres) otomatik olarak toplar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!scrapedData ? (
                    <>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Katılımcı Listesi URL Adresi</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input 
                                    placeholder="Örn: https://www.istanbulfurniturefair.com/tr/markalar" 
                                    value={scrapeUrl}
                                    onChange={(e) => {
                                        setScrapeUrl(e.target.value);
                                        setScrapeError(null);
                                    }}
                                    className={`pl-9 bg-zinc-950/50 border-zinc-800 text-white h-12 focus:border-[#FF6200] ${scrapeError ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {scrapeError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-sm">{scrapeError}</p>
                                </div>
                            )}
                        </div>

                        <Button 
                            onClick={handleScrape} 
                            disabled={isScraping || !scrapeUrl}
                            className="w-full h-12 text-base font-medium bg-[#FF6200] hover:bg-[#FF8000] text-white shadow-lg shadow-orange-900/20"
                        >
                            {isScraping ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Site ve Detay Sayfaları Taranıyor...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    Listeyi ve Detayları Tara
                                </>
                            )}
                        </Button>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 mt-4">
                             <p className="text-zinc-400 text-xs leading-relaxed flex flex-col gap-2">
                                <span><span className="text-blue-400 font-bold">Akıllı Tarama:</span> Bu araç, ana listedeki her bir firmanın detay sayfasına (örn. /company/...) otomatik olarak girer.</span>
                                <span className="opacity-70">İşlem detay sayfalarını da gezdiği için 10-30 saniye sürebilir. Lütfen bekleyiniz.</span>
                             </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                         <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                             <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                                    {scrapedData.length} Kayıt Bulundu
                                </Badge>
                             </div>
                             <div className="flex gap-2">
                                 <Button variant="outline" size="sm" onClick={() => { setScrapedData(null); setScrapeUrl(''); }}>
                                     <RefreshCw className="w-4 h-4 mr-2" />
                                     Yeni Tarama
                                 </Button>
                                 <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleDownload}>
                                     <Download className="w-4 h-4 mr-2" />
                                     Excel'e Aktar
                                 </Button>
                             </div>
                         </div>

                         <ScrollArea className="h-[400px] border border-zinc-800 rounded-md bg-zinc-950/50">
                            <Table>
                                <TableHeader className="bg-zinc-900 sticky top-0 z-10">
                                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                                        <TableHead className="text-zinc-400 w-[200px]">Firma Adı</TableHead>
                                        <TableHead className="text-zinc-400">Telefon</TableHead>
                                        <TableHead className="text-zinc-400">E-mail</TableHead>
                                        <TableHead className="text-zinc-400">Adres</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scrapedData.map((item, i) => (
                                        <TableRow key={i} className="border-zinc-800 hover:bg-zinc-900/50">
                                            <TableCell className="font-medium text-white">{item.companyName}</TableCell>
                                            <TableCell className="text-zinc-400 text-xs">{item.phone || '-'}</TableCell>
                                            <TableCell className="text-zinc-400 text-xs">{item.email || '-'}</TableCell>
                                            <TableCell className="text-zinc-400 text-xs max-w-[200px] truncate" title={item.address}>{item.address || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FairWebScraperTab;
