import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export default function AdminChatsPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role, email)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setMessages(data);
    }
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-display">Sohbet Kayıtları</h1>
        <p className="text-zinc-400">Son 100 mesajın denetim günlüğü.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
             <thead className="bg-zinc-900/50 text-xs uppercase font-medium text-zinc-500">
                <tr>
                   <th className="px-6 py-4">Zaman</th>
                   <th className="px-6 py-4">Gönderen</th>
                   <th className="px-6 py-4">Rol</th>
                   <th className="px-6 py-4">Mesaj İçeriği</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-zinc-800">
                {messages.map((msg) => (
                   <tr key={msg.id} className="hover:bg-zinc-900/20">
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                         {new Date(msg.created_at).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-white">
                         {msg.sender?.full_name || 'Bilinmeyen'}
                         <div className="text-xs text-zinc-600">{msg.sender?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs capitalize">
                         {msg.sender?.role?.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                         {msg.content}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}