import React from 'react';
import { Download, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DESIGNS = [
  { id: 1, title: 'Modern Booth A', year: '2023', size: '20x20', image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&q=80' },
  { id: 2, title: 'Eco Stand Design', year: '2023', size: '10x20', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80' },
  { id: 3, title: 'Tech Showcase', year: '2022', size: '30x30', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80' },
  { id: 4, title: 'Minimalist Corner', year: '2022', size: '15x15', image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80' },
];

function DesignArchive() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Design Archive</h2>
        <p className="text-slate-400">Library of past exhibition designs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DESIGNS.map((design) => (
          <div key={design.id} className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <div className="aspect-[4/3] overflow-hidden bg-slate-800">
              <img 
                src={design.image} 
                alt={design.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-slate-200">{design.title}</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                  {design.year}
                </span>
              </div>
              <p className="text-sm text-slate-500">{design.size}m • Custom Build</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignArchive;