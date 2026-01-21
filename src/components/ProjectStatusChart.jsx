import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

function ProjectStatusChart() {
  const statusData = [
    { label: 'Completed', value: 45, color: 'from-green-500 to-green-600' },
    { label: 'In Progress', value: 30, color: 'from-orange-500 to-orange-600' },
    { label: 'Pending', value: 15, color: 'from-amber-500 to-amber-600' },
    { label: 'On Hold', value: 10, color: 'from-slate-500 to-slate-600' },
  ];

  const maxValue = Math.max(...statusData.map(d => d.value));

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Project Status Overview</h3>
        <BarChart3 className="w-5 h-5 text-slate-400" />
      </div>
      <div className="space-y-6">
        {statusData.map((item, index) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">{item.label}</span>
              <span className="text-sm text-slate-400">{item.value}%</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-lg`}
              ></motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectStatusChart;