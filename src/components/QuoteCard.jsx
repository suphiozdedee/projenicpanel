import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, MapPin, Calendar, User, DollarSign, Building2, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function QuoteCard({ quote, onUpdate, onDelete }) {
  const isApproved = quote.status === 'Onaylandı';
  const isPending = quote.status === 'Onay Bekliyor';

  return (
    <div className="group relative flex flex-col h-72 bg-[#0A0A0A]/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all shadow-lg hover:shadow-xl">
        
        {/* Delete Button */}
        <button
            onClick={(e) => { e.stopPropagation(); onDelete(quote.id); }}
            className="absolute top-3 right-3 z-50 p-1.5 rounded-md bg-black/60 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all backdrop-blur-sm border border-white/5 hover:border-red-500"
            title="Teklifi Sil"
        >
            <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="p-4 pb-2 shrink-0">
            <div className="flex justify-between items-start">
                <div className="space-y-1 pr-8">
                     <h3 className="text-white font-bold text-base truncate leading-tight" title={quote.projectName}>
                        {quote.projectName}
                     </h3>
                     <div className="flex items-center gap-2">
                         <Badge 
                            variant="outline" 
                            className={cn(
                                "border-none px-2 py-0.5 text-[10px]",
                                isApproved ? "bg-green-500/10 text-green-400" : 
                                isPending ? "bg-amber-500/10 text-amber-400" : "bg-zinc-500/10 text-zinc-400"
                            )}
                         >
                            {quote.status}
                         </Badge>
                     </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-2 space-y-3 overflow-hidden">
             <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                      <Building2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate text-xs">{quote.fairName || 'Fuar Belirtilmedi'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate text-xs">
                          {quote.date ? format(new Date(quote.date), 'd MMMM yyyy', { locale: tr }) : '-'}
                      </span>
                  </div>
             </div>

             <div className="mt-2 pt-3 border-t border-white/5">
                 <div className="flex items-end gap-1">
                     <span className="text-2xl font-bold text-white tracking-tight">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quote.currency || 'TRY' }).format(quote.price)}
                     </span>
                 </div>
                 <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide mt-1">Toplam Tutar</div>
             </div>
        </div>

        {/* Footer */}
        <div className="p-3 mt-auto bg-[#0A0A0A]/60 border-t border-white/5 shrink-0 backdrop-blur-sm">
             <div className="flex gap-2">
                 <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
                    onClick={() => {}}
                 >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Görüntüle
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 px-0 text-zinc-400 hover:text-white hover:bg-white/5"
                    onClick={() => onUpdate(quote.id, {})}
                 >
                    <Pencil className="w-3.5 h-3.5" />
                 </Button>
             </div>
        </div>
    </div>
  );
}