
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { safeQuery } from '@/lib/networkUtils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Users, Briefcase, DollarSign, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalCustomers: 0,
    upcomingFairs: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!supabase) {
        setLoading(false);
        setError(true);
        return;
    }

    setLoading(true);
    setError(false);
    try {
      const [projectsRes, customersRes, fairsRes] = await Promise.all([
        safeQuery(
            () => supabase.from('projects').select('id, status, price'), 
            { key: 'dash_projects', ttl: 60000, errorMessage: 'Projeler yüklenirken hata oluştu.' }
        ),
        safeQuery(
            () => supabase.from('customers').select('id', { count: 'exact', head: true }), 
            { key: 'dash_customers', ttl: 300000, errorMessage: 'Müşteriler yüklenirken hata oluştu.' }
        ),
        safeQuery(
            () => supabase.from('fairs').select('id').gte('start_date', new Date().toISOString()), 
            { key: 'dash_fairs', ttl: 300000, errorMessage: 'Fuarlar yüklenirken hata oluştu.' }
        )
      ]);

      if (projectsRes.error || customersRes.error || fairsRes.error) {
        if (!projectsRes.data && !customersRes.count && !fairsRes.data) throw new Error('All requests failed');
      }

      const projects = projectsRes.data || [];
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => ['started', 'Tasarıma Başlandı', 'Üretimde', 'Onaylandı'].includes(p.status)).length;
      
      let totalRevenue = 0;
      if (user?.role === 'admin' || user?.revenueAccess) {
         totalRevenue = projects.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
      }

      setStats({
        totalProjects,
        activeProjects,
        totalCustomers: customersRes.count || 0,
        upcomingFairs: fairsRes.data?.length || 0,
        totalRevenue
      });

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF6200]" />
        </div>
    );
  }

  if (error) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
             <div className="p-4 bg-red-500/10 rounded-full">
                 <AlertCircle className="w-8 h-8 text-red-500" />
             </div>
             <h2 className="text-xl font-bold text-white">Veriler Yüklenemedi</h2>
             <p className="text-zinc-400">Sunucu ile bağlantı kurulamadı.</p>
             <Button variant="outline" onClick={fetchDashboardData}>
                 <RefreshCw className="w-4 h-4 mr-2" /> Yeniden Dene
             </Button>
        </div>
      );
  }

  const statCards = [
    { label: "Toplam Proje", value: stats.totalProjects, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Aktif Proje", value: stats.activeProjects, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Müşteriler", value: stats.totalCustomers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Yaklaşan Fuar", value: stats.upcomingFairs, icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  if (user?.role === 'admin' || user?.revenueAccess) {
      statCards.push({ 
          label: "Toplam Ciro", 
          value: `₺${stats.totalRevenue.toLocaleString()}`, 
          icon: DollarSign, 
          color: "text-emerald-500", 
          bg: "bg-emerald-500/10",
          colSpan: "col-span-1 md:col-span-2 lg:col-span-1"
      });
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Genel Bakış</h1>
        <p className="text-zinc-400 text-sm">Sistem durumu ve istatistikler.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {statCards.map((stat, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={stat.colSpan || ""}
            >
                <Card className="bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all group h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            {stat.label}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                             <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <p className="text-xs text-zinc-500 mt-1">Son güncelleme: Şimdi</p>
                    </CardContent>
                </Card>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-[#0A0A0A] border-zinc-800 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-zinc-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Proje Analitik Grafiği (Hazırlanıyor)</p>
                  <Button variant="secondary" size="sm" className="mt-4">
                      Detayları Gör
                  </Button>
              </div>
          </Card>
          <Card className="bg-[#0A0A0A] border-zinc-800 min-h-[300px] flex items-center justify-center">
               <div className="text-center text-zinc-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Fuar Takvimi Özeti (Hazırlanıyor)</p>
                  <Button variant="secondary" size="sm" className="mt-4">
                      Takvime Git
                  </Button>
              </div>
          </Card>
      </div>
    </div>
  );
}
