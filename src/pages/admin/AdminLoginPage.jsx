
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSimpleAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await login(username, password);
      
      if (error) throw new Error(error.message);
      
      if (data.role !== 'admin') {
         throw new Error('Bu alana sadece yöneticiler erişebilir.');
      }

      toast({
        title: "Yönetici Girişi Başarılı",
        description: "Admin paneline yönlendiriliyorsunuz...",
        className: "bg-green-600 text-white border-green-700"
      });
      
      navigate('/admin-dashboard');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Giriş Başarısız",
        description: err.message || "Kullanıcı adı veya şifre hatalı."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FF8C00]/5 blur-[100px] rounded-full" />
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[80px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
           <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#FF8C00]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#FF8C00]/20">
                 <ShieldCheck className="w-8 h-8 text-[#FF8C00]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Yönetici Paneli</h1>
              <p className="text-zinc-500 text-sm mt-1">Lütfen yönetici kimlik bilgilerinizle giriş yapın.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                 <label className="text-xs font-medium text-zinc-400 ml-1">Kullanıcı Adı</label>
                 <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FF8C00]/50 h-11"
                      placeholder="admin"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-medium text-zinc-400 ml-1">Şifre</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FF8C00]/50 h-11"
                      placeholder="••••••"
                    />
                 </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-medium h-11 mt-2"
                disabled={loading}
              >
                 {loading ? "Giriş Yapılıyor..." : (
                    <span className="flex items-center gap-2">
                       Giriş Yap <ArrowRight className="w-4 h-4" />
                    </span>
                 )}
              </Button>
           </form>

           <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-zinc-600">
                 Bu alan sadece yetkili personel içindir. Tüm giriş denemeleri kayıt altına alınmaktadır.
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
