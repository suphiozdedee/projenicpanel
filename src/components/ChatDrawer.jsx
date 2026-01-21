import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/Icon';
import ChatMessage from '@/components/ChatMessage';
import { getGeminiChat } from '@/services/geminiService';

function ChatDrawer({ isOpen, onClose, user }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the team chat! I'm your AI assistant. Ask me about project deadlines or design ideas.", sender: 'ai', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg = { id: Date.now(), text: userText, sender: 'user', timestamp: new Date().toISOString() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Trigger AI response for demo purposes
    if (userText.toLowerCase().includes('@ai') || true) { // Always respond in this demo
      setIsTyping(true);
      try {
        const aiResponse = await getGeminiChat(userText);
        setMessages(prev => [...prev, { ...aiResponse, id: Date.now() + 1 }]);
      } catch (error) {
        console.error("AI Error", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <h3 className="font-bold text-white flex items-center gap-2">
                Team Chat
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-slate-800 rounded-2xl p-3 rounded-bl-none flex gap-1 items-center h-[42px]">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-slate-800 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 border border-slate-700"
                />
                <button 
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <Icons.Attach className="w-4 h-4" />
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Icons.Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatDrawer;