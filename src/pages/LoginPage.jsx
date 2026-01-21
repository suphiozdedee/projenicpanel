import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, Lock, ArrowRight, UserPlus, HelpCircle, LifeBuoy, Fingerprint } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import BlueprintButton from '@/components/BlueprintButton';
import BlueprintButtonGroup from '@/components/BlueprintButtonGroup';

// --- Architectural Background Grid Component ---
const TechGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Base Noise */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
    
    {/* Main Grid Lines */}
    <div className="absolute inset-0" style={{ 
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px'
    }}></div>

    {/* Sub Grid Lines - Finer detail */}
    <div className="absolute inset-0" style={{ 
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}></div>

    {/* Architectural Diagonal Lines */}
    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
          <path d="M0,0 L0,40" stroke="white" strokeWidth="1" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
      
      {/* Decorative Blueprint Circles/Arcs */}
      <circle cx="10%" cy="20%" r="300" stroke="rgba(255,165,0,0.1)" strokeWidth="1" fill="none" strokeDasharray="10 20" />
      <circle cx="90%" cy="80%" r="400" stroke="rgba(59,130,246,0.1)" strokeWidth="1" fill="none" strokeDasharray="5 15" />
      
      {/* Tech Markers */}
      <path d="M50,50 L100,50 L100,100" stroke="rgba(255,165,0,0.5)" strokeWidth="2" fill="none" />
      <path d="M50,900 L100,900 L100,850" stroke="rgba(255,165,0,0.5)" strokeWidth="2" fill="none" />
      <path d="M1800,50 L1750,50 L1750,100" stroke="rgba(255,165,0,0.5)" strokeWidth="2" fill="none" />
    </svg>

    {/* Glowing Particles - Enhanced Visibility */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-400 rounded-full shadow-[0_0_8px_rgba(255,165,0,0.8)]"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.3 
          }}
          animate={{ 
            y: [null, Math.random() * -100],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  </div>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Use SimpleAuth hook instead of Supabase Auth
  const { login, user, isAuthenticated } = useSimpleAuth();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/workflow', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen kullanıcı adı ve şifrenizi girin.",
        className: "bg-red-950 border-red-900 text-red-200"
      });
      return;
    }

    setIsLoading(true);
    try {
      const usernameToUse = username.trim();
      
      const { error } = await login(usernameToUse, password);
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
        className: "bg-emerald-950 border-emerald-900 text-emerald-200"
      });
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Giriş Başarısız",
        description: error.message || "Kullanıcı adı veya şifre hatalı.",
        className: "bg-red-950 border-red-900 text-red-200"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50
      }
    }
  };

  const logoUrl = "https://horizons-cdn.hostinger.com/b6d2081a-ee07-4354-8c90-69e8e22eec7a/07c9390d9bf83cb7e0ef1d96351a1f58.png";

  return (
    <div className="min-h-screen w-full flex bg-[#030303] overflow-hidden relative selection:bg-orange-500/30 selection:text-orange-200 font-sans">
      <Helmet>
        <title>Giriş Yap | Projenic Portal</title>
      </Helmet>

      {/* --- Technological & Architectural Background --- */}
      <TechGridBackground />
      
      {/* Animated Orbs - Subtle Depth */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, -60, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-orange-600/10 blur-[140px]"
        />
      </div>

      {/* Main Content Container - Compact max-width for 13" screens */}
      <div className="container mx-auto flex min-h-screen items-center justify-center relative z-10 px-4 py-2 sm:py-4 lg:py-0">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Panel: Brand & Vision - Hidden on smaller screens, optimized spacing on large */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col space-y-6"
          >
            <motion.div variants={itemVariants}>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-600 mb-6 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
              <h1 
                className="text-3xl xl:text-4xl font-black text-white leading-[1.1] tracking-tight mb-6 drop-shadow-2xl whitespace-nowrap"
                style={{ fontFamily: "'Futura PT', 'Avenir', 'Century Gothic', 'Trebuchet MS', sans-serif" }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] via-[#FFA500] to-[#FF6B35]">Geleceği </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FFA500] to-[#FF8C00]">
                  Tasarlayın.
                </span>
              </h1>
              <p 
                className="text-sm text-gray-400 leading-relaxed max-w-lg font-medium border-l-2 border-white/10 pl-4 italic"
                style={{ fontFamily: "'Futura PT', 'Avenir', 'Century Gothic', 'Trebuchet MS', sans-serif" }}
              >
                Yaratıcılığın sınırlarını zorlayın. Projelerinizi tek bir merkezden yönetin, 
                verimliliğinizi artırın ve kusursuz iş akışları oluşturun.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-2">
               {/* Feature Cards with Glassmorphism */}
               <div className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Tech Corner Accent */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 group-hover:border-orange-500/30 transition-colors"></div>

                  <div className="relative z-10">
                    <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-orange-500/20">
                      <LifeBuoy className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-white font-bold text-base mb-1 tracking-wide">Tam Kontrol</h3>
                    <p className="text-xs text-gray-500">Tüm süreçler parmaklarınızın ucunda.</p>
                  </div>
               </div>
               
               <div className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Tech Corner Accent */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 group-hover:border-blue-500/30 transition-colors"></div>

                  <div className="relative z-10">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                      <Fingerprint className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-white font-bold text-base mb-1 tracking-wide">Güvenli Erişim</h3>
                    <p className="text-xs text-gray-500">Verileriniz en yüksek güvenlikle korunur.</p>
                  </div>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-3 pt-2">
              <BlueprintButton variant="outline" onClick={() => window.open('https://projenic.com', '_blank')} className="h-9 px-4 text-sm">
                Web Sitemiz
              </BlueprintButton>
              <BlueprintButton variant="outline" onClick={() => toast({ title: "Belgeler", description: "Dökümantasyon yakında eklenecek." })} className="h-9 px-4 text-sm">
                <HelpCircle className="w-3 h-3 mr-2" />
                Dökümantasyon
              </BlueprintButton>
            </motion.div>
          </motion.div>

          {/* Right Panel: Login Form Card - Optimized for 13" MacBook */}
          <div className="w-full flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, rotateY: 15, x: 50 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="w-full max-w-[360px] md:max-w-[420px] perspective-1000"
            >
              <div className="bg-[#050505]/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                
                {/* Card Glow Effects */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                {/* Tech Border Line - Top */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50"></div>
                {/* Tech Border Line - Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-30"></div>

                <div className="relative z-20 flex flex-col items-center">
                  
                  {/* Logo Section - Compacted Size */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 relative"
                  >
                    <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150"></div>
                    <img 
                      src={logoUrl} 
                      alt="Projenic Logo" 
                      className="h-12 w-auto object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </motion.div>

                  <div className="w-full mb-6 text-center">
                    <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Hoş Geldiniz</h2>
                    <p className="text-gray-500 text-sm font-medium">Hesabınıza güvenle giriş yapın</p>
                  </div>

                  <form onSubmit={handleLogin} className="w-full space-y-5">
                    
                    {/* Username Input - Compact h-9, text-sm */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Kullanıcı Adı</Label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <User className="h-4 w-4 text-gray-500 group-focus-within/input:text-orange-500 transition-colors duration-300" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Kullanıcı adınızı girin"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 h-9 bg-[#121212]/50 border-white/5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-orange-500/40 focus:bg-[#161616] focus:ring-0 rounded-lg transition-all duration-300 font-medium hover:border-white/10"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password Input - Compact h-9, text-sm */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                         <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Şifre</Label>
                         <button 
                            type="button"
                            className="text-[10px] text-orange-500 hover:text-orange-400 font-medium uppercase tracking-wider bg-transparent border-0 p-0 transition-colors"
                            onClick={() => toast({ title: "Şifre Sıfırlama", description: "Lütfen sistem yöneticinizle iletişime geçin." })}
                         >
                            Unuttum?
                         </button>
                      </div>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Lock className="h-4 w-4 text-gray-500 group-focus-within/input:text-orange-500 transition-colors duration-300" />
                        </div>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-9 bg-[#121212]/50 border-white/5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-orange-500/40 focus:bg-[#161616] focus:ring-0 rounded-lg transition-all duration-300 font-medium hover:border-white/10"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    {/* Checkbox - Compact */}
                    <div className="flex items-center space-x-2 pt-0.5 pl-1">
                      <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                          className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-4 w-4 rounded bg-[#161616]"
                      />
                      <label
                        htmlFor="remember"
                        className="text-xs font-medium text-gray-500 cursor-pointer select-none hover:text-gray-400 transition-colors"
                      >
                        Oturumu açık tut
                      </label>
                    </div>

                    {/* Actions */}
                    <BlueprintButtonGroup className="pt-3 gap-3">
                      
                      {/* Primary Login Action - Compact */}
                      <BlueprintButton 
                        type="submit" 
                        variant="primary"
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="h-9 px-4 text-sm"
                      >
                        {isLoading ? (
                            <>
                              <span>Giriş...</span>
                            </>
                          ) : (
                            <>
                              <span>Giriş Yap</span>
                              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform ml-1" />
                            </>
                          )}
                      </BlueprintButton>

                      {/* Secondary Sign Up Action - Compact */}
                      <BlueprintButton 
                        variant="secondary"
                        onClick={() => toast({ title: "Kayıt Ol", description: "Kayıt işlemleri sadece davetiye ile yapılmaktadır." })}
                        className="h-9 px-4 text-sm"
                      >
                         <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                         Hesap Oluştur
                      </BlueprintButton>
                    </BlueprintButtonGroup>

                  </form>
                </div>
                
                {/* Footer Info inside card - Smaller text */}
                <div className="mt-6 pt-4 border-t border-white/5 text-center relative z-20 flex justify-between items-center px-1">
                   <span className="text-gray-600 text-[9px] font-medium tracking-wider uppercase">
                     Projenic v2.0
                   </span>
                   <span className="text-gray-600 text-[9px] font-medium tracking-wider uppercase flex items-center gap-1">
                     <Lock className="w-2.5 h-2.5" /> Secure
                   </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}