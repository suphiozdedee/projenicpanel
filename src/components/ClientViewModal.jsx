import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Globe, Phone, Mail } from 'lucide-react';

// This component can be used when clicking on a client name in the Kanban board
function ClientViewModal({ isOpen, onClose, client }) {
  if (!client) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="h-32 bg-gradient-to-r from-orange-600 to-purple-700 relative">
               <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="-mt-12 mb-6">
                <div className="w-24 h-24 bg-slate-800 rounded-xl border-4 border-slate-900 flex items-center justify-center shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{client.name}</h2>
              <p className="text-slate-400 text-sm mb-6">Tech & Innovation Partner</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>contact@client.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <span>www.example.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ClientViewModal;