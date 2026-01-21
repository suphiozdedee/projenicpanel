import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeProjectRisk } from '@/lib/gemini';

function NewProjectModal({ isOpen, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    // Mock analysis
    const result = await analyzeProjectRisk({});
    setAiAnalysis(result);
    setAnalyzing(false);
  };

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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl font-bold text-white">Create New Project</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input className="bg-slate-800 border-slate-700 text-white" placeholder="e.g. CES 2024 Booth" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input className="bg-slate-800 border-slate-700 text-white" placeholder="Client Company Name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stand Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Island', 'Peninsula', 'Corner'].map(type => (
                    <button key={type} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-orange-500 hover:text-white transition-all text-sm font-medium">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Dimensions (ft)</Label>
                  <div className="flex gap-2">
                    <Input className="bg-slate-800 border-slate-700 text-white" placeholder="20" />
                    <span className="self-center text-slate-500">x</span>
                    <Input className="bg-slate-800 border-slate-700 text-white" placeholder="20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    AI Risk Analysis
                  </h4>
                  <Button size="sm" variant="outline" onClick={handleAIAnalysis} disabled={analyzing} className="text-xs h-8 border-slate-600 text-slate-300">
                    {analyzing ? 'Analyzing...' : 'Run Analysis'}
                  </Button>
                </div>
                {aiAnalysis && (
                  <div className="text-sm text-slate-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Risk Level:</span>
                      <span className="text-green-400 font-bold">{aiAnalysis.riskLevel}</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-400 text-xs">
                      {aiAnalysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {!aiAnalysis && !analyzing && (
                  <p className="text-xs text-slate-500">Run AI analysis to detect potential timeline conflicts or missing requirements.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">Create Project</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default NewProjectModal;