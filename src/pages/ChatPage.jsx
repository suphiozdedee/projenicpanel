import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Send, User, Bot, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export default function ChatPage() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchUsers();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        fetchSingleMessage(payload.new.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUsers = async () => {
     // Mocking active status based on recent profiles or just fetching all for demo
     const { data, error } = await supabase.from('profiles').select('*');
     if(data) {
        // Randomly assign online status for demo purposes, but always make current user online
        const withStatus = data.map(u => ({
           ...u,
           isOnline: u.id === userProfile.id ? true : Math.random() > 0.6
        }));
        setActiveUsers(withStatus);
     }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, role)')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data);
    setLoading(false);
  };

  const fetchSingleMessage = async (msgId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role)')
        .eq('id', msgId)
        .single();
        
      if (!error && data) {
          setMessages(prev => {
              if (prev.find(m => m.id === data.id)) return prev;
              return [...prev, data];
          });
      }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          content: newMessage,
          sender_id: (await supabase.auth.getUser()).data.user.id,
        }
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex max-w-6xl mx-auto gap-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
         <div className="mb-4">
            <h1 className="text-3xl font-bold text-white font-display">Ekip İletişimi</h1>
            <p className="text-zinc-400 text-sm">Satış ve Tasarım ekipleri için gerçek zamanlı sohbet.</p>
         </div>

         <Card className="flex-1 bg-[#0a0a0a]/60 border-zinc-800 flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
               {messages.map((msg) => {
               const isMe = msg.sender_id === userProfile?.id;
               return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarFallback className={`${isMe ? 'bg-[#FF6200]' : 'bg-zinc-700'} text-white text-xs`}>
                           {msg.sender?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                     </Avatar>
                     
                     <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-zinc-400">{msg.sender?.full_name}</span>
                           <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 rounded uppercase">{msg.sender?.role?.replace('_', ' ')}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                           isMe 
                           ? 'bg-[#FF6200] text-white rounded-tr-none' 
                           : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                        }`}>
                           {msg.content}
                        </div>
                        <span className="text-[10px] text-zinc-600">
                           {new Date(msg.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                     </div>
                     </div>
                  </div>
               );
               })}
               {messages.length === 0 && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                     <Bot className="w-12 h-12 mb-2" />
                     <p>Henüz mesaj yok. Sohbeti başlatın!</p>
                  </div>
               )}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex gap-2">
               <Input 
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder="Mesajınızı yazın..."
               className="flex-1 bg-black border-zinc-700 focus:border-[#FF6200] text-white"
               />
               <Button type="submit" className="bg-[#FF6200] hover:bg-[#FF6200]/90 text-white">
               <Send className="w-4 h-4" />
               </Button>
            </form>
         </Card>
      </div>

      {/* Online Users Sidebar */}
      <div className="w-64 hidden lg:flex flex-col h-full pt-20">
         <Card className="flex-1 bg-[#0a0a0a]/60 border-zinc-800 overflow-hidden backdrop-blur-sm p-4">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                Çevrimiçi Üyeler
             </h3>
             <div className="space-y-3">
                {activeUsers.map(user => (
                   <div key={user.id} className="flex items-center gap-3">
                      <div className="relative">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                               {user.full_name?.charAt(0)}
                            </AvatarFallback>
                         </Avatar>
                         {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></span>
                         )}
                      </div>
                      <div className="overflow-hidden">
                         <p className="text-sm text-zinc-300 truncate">{user.full_name}</p>
                         <p className="text-[10px] text-zinc-500 capitalize">{user.role?.replace('_', ' ')}</p>
                      </div>
                   </div>
                ))}
             </div>
         </Card>
      </div>
    </div>
  );
}