
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Bell, BarChart3, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock stats for display - normally fetched from DB
  const stats = [
    { title: "Toplam Personel", value: "12", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", link: "/admin/users" },
    { title: "Aktif Projeler", value: "24", icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10", link: "/projects" },
    { title: "Bildirimler", value: "5", icon: Bell, color: "text-purple-500", bg: "bg-purple-500/10", link: "#" },
    { title: "Aylık Ciro", value: "₺450K", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/operations" },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Yönetici Paneli</h1>
        <p className="text-zinc-400">Sistem genel durumunu ve performansını buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-[#121212] border-white/5 hover:border-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                 <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <Button 
                variant="link" 
                className="text-xs text-zinc-500 hover:text-white p-0 h-auto mt-2 flex items-center gap-1"
                onClick={() => navigate(stat.link)}
              >
                 Detayları Gör <ArrowUpRight className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="bg-[#121212] border-white/5">
            <CardHeader>
               <CardTitle className="text-white">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[1,2,3].map((_, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500" />
                           <div>
                              <p className="text-sm text-zinc-300 font-medium">Yeni proje oluşturuldu: Stand X</p>
                              <p className="text-xs text-zinc-500">2 saat önce • Ahmet Yılmaz</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-[#121212] border-white/5">
            <CardHeader>
               <CardTitle className="text-white">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <Button 
                    variant="outline" 
                    className="justify-start text-zinc-300 border-white/10 hover:bg-white/5 hover:text-white h-12"
                    onClick={() => navigate('/admin/users')}
                >
                    <Users className="mr-2 h-4 w-4" /> Personel Yönetimi
                </Button>
                <Button 
                    variant="outline" 
                    className="justify-start text-zinc-300 border-white/10 hover:bg-white/5 hover:text-white h-12"
                    onClick={() => navigate('/projects')}
                >
                    <Briefcase className="mr-2 h-4 w-4" /> Tüm Projeleri Listele
                </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
