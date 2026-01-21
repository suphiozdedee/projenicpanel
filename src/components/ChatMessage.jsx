import React from 'react';
import { Icons } from '@/components/Icon';

function ChatMessage({ message }) {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl p-3 ${
        isUser 
          ? 'bg-orange-600 text-white rounded-br-none' 
          : isAi
            ? 'bg-purple-600/20 text-purple-100 border border-purple-500/30 rounded-bl-none'
            : 'bg-slate-800 text-slate-200 rounded-bl-none'
      }`}>
        {isAi && (
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-400 mb-1">
            <Icons.Bot className="w-3 h-3" /> AI Assistant
          </div>
        )}
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span className="text-[10px] opacity-50 block text-right mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;