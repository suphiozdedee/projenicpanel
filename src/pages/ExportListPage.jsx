
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Loader2, Download, Search, Link as LinkIcon, Database, ClipboardPaste, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { ExportService } from '@/services/exportService';
import { exportCustomersToExcel } from '@/lib/excelExport';
import ManualDataImportTab from '@/components/ManualDataImportTab';
import DataPreviewTable from '@/components/DataPreviewTable';
import FairWebScraperTab from '@/components/FairWebScraperTab';
import { safeQuery } from '@/lib/networkUtils';

export default function ExportListPage() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fairs, setFairs] = useState([]);
  const [selectedFairId, setSelectedFairId] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [fetchingFairs, setFetchingFairs] = useState(true);

  const [importedData, setImportedData] = useState(null);

  useEffect(() => {
    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    try {
      const { data, error } = await safeQuery(
        () => supabase
            .from('fairs')
            .select('id, fair_name, start_date')
            .order('start_date', { ascending: false }),
        { errorMessage: 'Fuarlar listelenirken bir hata oluştu.' }
      );

      if (error) throw error;
      setFairs(data || []);
    } catch (error) {
      console.error("Error fetching fairs:", error);
    } finally {
      setFetchingFairs(false);
    }
  };

  const handleDatabaseExport = async () => {
    const inputToProcess = manualInput || selectedFairId;

    if (!inputToProcess) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen bir fuar seçin veya link girin."
      });
      return;
    }

    setLoading(true);
    try {
      // ExportService might need internal updates to use safeQuery, but for now we wrap the call
      // Assuming ExportService.processExport handles its own logic, but we catch errors here.
      const result = await ExportService.processExport(inputToProcess);

      toast({
        title: "İşlem Başarılı",
        description: `${result.count} müşteri içeren "${result.fairName}" listesi indiriliyor.`,
        className: "bg-green-500/10 border-green-500 text-green-500"
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "İşlem Başarısız",
        description: error.message || "Excel dosyası oluşturulurken bir hata meydana geldi."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualExport = (dataToExport) => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      exportCustomersToExcel(dataToExport, `manuel_liste_${dateStr}`);
      toast({
        title: "İndirme Başlatıldı",
        description: "Excel dosyası oluşturuluyor...",
        className: "bg-green-500/10 border-green-500 text-green-500"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dosya oluşturulamadı: " + error.message
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="glass-panel p-6">
        <h1 className="text-3xl font-bold text-white tracking-tight font-display">Liste Çıkart</h1>
        <p className="text-lg text-zinc-400 mt-1">Fuar katılımcı listelerini yönetin ve dışa aktarın.</p>
      </div>

      <Tabs defaultValue="fair-scraper" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800 p-1 rounded-lg mb-6">
           <TabsTrigger 
            value="fair-scraper"
            className="data-[state=active]:bg-[#FF6200] data-[state=active]:text-white text-zinc-400 rounded-md transition-all"
          >
            <Globe className="w-4 h-4 mr-2" />
            Otomatik Tara
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="data-[state=active]:bg-[#FF6200] data-[state=active]:text-white text-zinc-400 rounded-md transition-all"
          >
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Veri İçe Aktar
          </TabsTrigger>
          <TabsTrigger 
            value="database"
            className="data-[state=active]:bg-[#FF6200] data-[state=active]:text-white text-zinc-400 rounded-md transition-all"
          >
            <Database className="w-4 h-4 mr-2" />
            Veritabanından
          </TabsTrigger>
        </TabsList>

        {/* --- WEB SCRAPING TAB --- */}
        <TabsContent value="fair-scraper" className="space-y-6">
           <FairWebScraperTab />
        </TabsContent>

        {/* --- MANUAL IMPORT TAB --- */}
        <TabsContent value="manual" className="space-y-6">
            {!importedData ? (
                <ManualDataImportTab onDataParsed={setImportedData} />
            ) : (
                <DataPreviewTable 
                  initialData={importedData} 
                  onReset={() => setImportedData(null)}
                  onExport={handleManualExport}
                />
            )}
        </TabsContent>

        {/* --- DATABASE TAB --- */}
        <TabsContent value="database" className="space-y-6">
          <Card className="glass-card bg-zinc-900/40 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileSpreadsheet className="w-5 h-5 text-[#FF6200]" />
                Veritabanı Export
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Sistemde kayıtlı müşteri ve fuar verilerini Excel formatında indirin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label className="text-zinc-300">Kayıtlı Fuar Listesinden Seç</Label>
                <Select 
                  value={selectedFairId} 
                  onValueChange={(val) => {
                      setSelectedFairId(val);
                      setManualInput(''); 
                  }}
                  disabled={fetchingFairs}
                >
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-white h-12">
                    <SelectValue placeholder={fetchingFairs ? "Fuarlar yükleniyor..." : "Fuar Seçiniz"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                    {fairs.length === 0 ? (
                       <SelectItem value="none" disabled>Kayıtlı fuar bulunamadı</SelectItem>
                    ) : (
                      fairs.map((fair) => (
                        <SelectItem key={fair.id} value={fair.id}>
                          {fair.fair_name} ({fair.start_date ? fair.start_date.split('-')[0] : 'Tarih Yok'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0f0f0f] px-2 text-zinc-500">Veya Link Kullan</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Fuar Linki veya ID'si Girin</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    placeholder="Örn: https://.../fair/123e4567-e89b... veya direkt ID" 
                    value={manualInput}
                    onChange={(e) => {
                        setManualInput(e.target.value);
                        setSelectedFairId(''); 
                    }}
                    className="pl-9 bg-zinc-950/50 border-zinc-800 text-white h-12 focus:border-[#FF6200]"
                  />
                </div>
              </div>

              <Button 
                  onClick={handleDatabaseExport} 
                  disabled={loading || (!selectedFairId && !manualInput)}
                  variant="default"
                  className="w-full h-12 text-base font-medium shadow-lg shadow-orange-900/20"
              >
                  {loading ? (
                      <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Hazırlanıyor...
                      </>
                  ) : (
                      <>
                          <Download className="mr-2 h-5 w-5" />
                          Listeyi İndir (.xlsx)
                      </>
                  )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
