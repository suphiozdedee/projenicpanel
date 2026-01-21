import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, RefreshCw, AlertTriangle, Phone, MapPin, Mail } from 'lucide-react';

export default function ScrapedDataPreview({ data, onDownload, onReset }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
        <AlertTriangle className="w-10 h-10 mb-3 opacity-50" />
        <p>Görüntülenecek veri bulunamadı.</p>
        <Button variant="link" onClick={onReset} className="mt-2 text-[#FF6200]">
          Yeni Arama Yap
        </Button>
      </div>
    );
  }

  // Count reliable data
  const phoneCount = data.filter(d => d.phone).length;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-medium text-white flex items-center gap-2">
            Sonuçlar
            <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full border border-green-500/20">
                {data.length} Kayıt
            </span>
           </h3>
           <p className="text-xs text-zinc-500 mt-1">
             Bulunan kayıtların {phoneCount} tanesi telefon numarası içermektedir.
           </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={onReset} className="flex-1 md:flex-none border-zinc-700 hover:bg-zinc-800 text-zinc-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Temizle
          </Button>
          <Button onClick={onDownload} className="flex-1 md:flex-none bg-[#FF6200] hover:bg-[#FF8000] text-white">
            <Download className="w-4 h-4 mr-2" />
            Excel Olarak İndir
          </Button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-zinc-900 sticky top-0 z-10">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400 w-[250px]">Firma Adı</TableHead>
                <TableHead className="text-zinc-400 w-[160px]">İletişim</TableHead>
                <TableHead className="text-zinc-400">Adres / Detay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-zinc-200 align-top py-3">
                    {row.company_name}
                  </TableCell>
                  <TableCell className="text-zinc-400 align-top py-3">
                    <div className="flex flex-col gap-1">
                        {row.phone ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{row.phone}</span>
                            </div>
                        ) : (
                            <span className="text-zinc-600 text-xs">-</span>
                        )}
                        {row.email && (
                             <div className="flex items-center gap-2 text-blue-400">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs truncate max-w-[140px]" title={row.email}>{row.email}</span>
                            </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs align-top py-3">
                    <div className="flex gap-2">
                        {row.address && <MapPin className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />}
                        <span className="line-clamp-2" title={row.address || row.raw_text}>
                            {row.address || row.raw_text || '-'}
                        </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      <p className="text-xs text-zinc-600 text-center italic">
        * Web scraping otomatik bir işlemdir. Bazı bilgiler site yapısına bağlı olarak eksik olabilir.
      </p>
    </div>
  );
}