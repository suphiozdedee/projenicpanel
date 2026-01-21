import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, TrendingUp, Calendar } from 'lucide-react';

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateRevenue() {
      setLoading(true);
      // Fetch all approved projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or('status.eq.Onaylandı,status.eq.Approved')
        .order('created_at', { ascending: false });

      if (data) {
        // Group by Month (Format: YYYY-MM)
        const grouped = data.reduce((acc, project) => {
           const date = new Date(project.created_at);
           const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
           
           if (!acc[key]) {
              acc[key] = { month: key, tl: 0, usd: 0, eur: 0, count: 0 };
           }
           
           acc[key].count += 1;
           const price = Number(project.price) || 0;
           if (project.currency === 'TL') acc[key].tl += price;
           else if (project.currency === 'USD') acc[key].usd += price;
           else if (project.currency === 'EUR') acc[key].eur += price;
           
           return acc;
        }, {});

        // Convert to array and sort by date descending
        const sortedData = Object.values(grouped).sort((a, b) => b.month.localeCompare(a.month));
        setRevenueData(sortedData);
      }
      setLoading(false);
    }
    calculateRevenue();
  }, []);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold text-white font-display">Finansal Raporlar</h1>
        <p className="text-zinc-400">Onaylanmış projelerin aylık gelir dökümü.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-[#0a0a0a] border-zinc-800">
             <CardContent className="p-6">
                 <p className="text-sm font-medium text-zinc-400">Toplam TL Ciro (Yıl)</p>
                 <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                     ₺{revenueData.reduce((sum, d) => sum + d.tl, 0).toLocaleString()}
                 </h3>
             </CardContent>
         </Card>
         <Card className="bg-[#0a0a0a] border-zinc-800">
             <CardContent className="p-6">
                 <p className="text-sm font-medium text-zinc-400">Toplam USD Ciro (Yıl)</p>
                 <h3 className="text-2xl font-bold text-blue-400 mt-1">
                     ${revenueData.reduce((sum, d) => sum + d.usd, 0).toLocaleString()}
                 </h3>
             </CardContent>
         </Card>
         <Card className="bg-[#0a0a0a] border-zinc-800">
             <CardContent className="p-6">
                 <p className="text-sm font-medium text-zinc-400">Toplam EUR Ciro (Yıl)</p>
                 <h3 className="text-2xl font-bold text-purple-400 mt-1">
                     €{revenueData.reduce((sum, d) => sum + d.eur, 0).toLocaleString()}
                 </h3>
             </CardContent>
         </Card>
      </div>

      <Card className="bg-[#0a0a0a] border-zinc-800">
         <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF6200]" />
                Aylık Gelir Dökümü
            </CardTitle>
         </CardHeader>
         <CardContent>
            {loading ? (
                <div className="text-center py-8 text-zinc-500">Hesaplanıyor...</div>
            ) : revenueData.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Henüz onaylanmış gelir verisi yok.</div>
            ) : (
                <div className="relative overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900/50 text-xs uppercase font-medium text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Ay / Yıl</th>
                                <th className="px-6 py-4">Proje Sayısı</th>
                                <th className="px-6 py-4">TL Hakediş</th>
                                <th className="px-6 py-4">USD Hakediş</th>
                                <th className="px-6 py-4 rounded-tr-lg">EUR Hakediş</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {revenueData.map((row) => (
                                <tr key={row.month} className="hover:bg-zinc-900/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-white">
                                        {row.month}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {row.count} Adet
                                    </td>
                                    <td className="px-6 py-4 text-emerald-400 font-medium">
                                        ₺{row.tl.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-blue-400 font-medium">
                                        ${row.usd.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-purple-400 font-medium">
                                        €{row.eur.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}