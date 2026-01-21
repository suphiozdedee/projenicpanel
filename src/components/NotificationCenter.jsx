
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, RotateCcw, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { NotificationService } from '@/services/NotificationService';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BriefDetailDialog from './BriefDetailDialog';
import QuoteViewDialog from './QuoteViewDialog';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // Dialog controls for direct viewing
  const [viewBriefId, setViewBriefId] = useState(null);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [briefForDialog, setBriefForDialog] = useState(null);

  const [viewQuoteBriefId, setViewQuoteBriefId] = useState(null);
  const [isQuoteViewOpen, setIsQuoteViewOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await NotificationService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setOpen(false);
  };

  const fetchBriefAndOpen = async (briefId) => {
      const { data } = await supabase.from('projects').select('*').eq('id', briefId).single();
      if (data) {
          setBriefForDialog(data);
          setIsBriefOpen(true);
      }
  };

  const handleNotificationClick = async (notification) => {
      if (!notification.read) {
          await markAsRead(notification.id);
      }

      setOpen(false);

      if (notification.type === 'quote_request') {
          // Navigate to quotes page
          navigate('/quotes');
      } else if (notification.type === 'quote_sent' || notification.type === 'quote_status_update') {
          // Open quote view dialog on current page if possible or navigate
          // Ideally we want to see the specific quote or brief details
          // Let's open Brief Detail which has "View Quotes"
          if (notification.brief_id) {
             // We can check if we are on a page where we can open dialog or navigate to projects
             // For simplicity, navigate to projects but maybe we can trigger a global dialog context
             // Let's try to just open the dialog components rendered here if valid
             navigate('/projects'); 
             // Note: In a real app we'd use a global UI store or URL params to open specific brief
          }
      } else if (notification.type === 'revize_talep' && notification.related_project_id) {
          navigate('/projects', { 
              state: { highlightProjectId: notification.related_project_id } 
          });
      }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
      switch(type) {
          case 'revize_talep': return <RotateCcw className="w-4 h-4 text-orange-500" />;
          case 'quote_request': return <FileText className="w-4 h-4 text-blue-500" />;
          case 'quote_sent': return <Send className="w-4 h-4 text-green-500" />;
          case 'quote_status_update': return <CheckCheck className="w-4 h-4 text-purple-500" />;
          default: return <div className="w-2 h-2 rounded-full bg-[#FF8C00] shadow-[0_0_8px_#FF8C00]" />;
      }
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF8C00] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg shadow-orange-900/50 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#121212] border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl" 
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF8C00]" />
            <span className="font-bold text-white text-sm">Bildirimler</span>
          </div>
          {unreadCount > 0 && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={markAllRead}
               className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
             >
               <CheckCheck className="w-3 h-3 mr-1" />
               Tümünü Okundu İşaretle
             </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-8 text-zinc-500">
               <div className="w-6 h-6 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin" />
               <span className="text-xs">Yükleniyor...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-8 text-zinc-500">
              <Bell className="w-8 h-8 opacity-20" />
              <span className="text-sm">Hiç yeni bildiriminiz yok.</span>
            </div>
          ) : (
            <div className="flex flex-col">
               <AnimatePresence>
                 {notifications.map((notification) => (
                   <motion.div
                     key={notification.id}
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                     className={`relative p-4 border-b border-white/5 hover:bg-white/[0.02] group transition-colors cursor-pointer ${!notification.read ? 'bg-white/[0.03]' : ''}`}
                     onClick={() => handleNotificationClick(notification)}
                   >
                     <div className="flex items-start gap-3">
                        <div className="mt-1.5 shrink-0">
                            {getIconForType(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className={`text-sm leading-snug ${!notification.read ? 'text-white font-medium' : 'text-zinc-400'}`}>
                             {notification.message}
                           </p>
                           <p className="text-[10px] text-zinc-500">
                             {new Date(notification.created_at).toLocaleString('tr-TR')}
                           </p>
                        </div>
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 self-center" />
                        )}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
    
    {/* Global Dialogs for Notifications if needed */}
    <BriefDetailDialog 
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        project={briefForDialog}
    />
    </>
  );
}
