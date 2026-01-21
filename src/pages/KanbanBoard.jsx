import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-orange-500' },
  { id: 'review', title: 'Review', color: 'bg-yellow-500' },
  { id: 'done', title: 'Completed', color: 'bg-green-500' },
];

const TASKS = [
  { id: 1, title: 'CES 2024 Booth Design', client: 'TechCorp', status: 'in-progress', dueDate: '2 days' },
  { id: 2, title: 'MWC Barcelona Logistics', client: 'MobileSys', status: 'todo', dueDate: '1 week' },
  { id: 3, title: 'IFA Berlin Floor Plan', client: 'AudioPro', status: 'review', dueDate: 'Tomorrow' },
  { id: 4, title: 'Print Materials Approval', client: 'TechCorp', status: 'done', dueDate: 'Yesterday' },
];

function KanbanBoard() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Board</h2>
          <p className="text-slate-400">Manage tasks and workflows</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="w-80 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <span className="font-semibold text-slate-200">{col.title}</span>
                </div>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                  {TASKS.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {TASKS.filter(task => task.status === col.id).map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={`task-${task.id}`}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:border-orange-500/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                        {task.client}
                      </span>
                      <button className="text-slate-500 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-slate-200 font-medium mb-3">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] text-white">
                        {task.client.charAt(0)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;