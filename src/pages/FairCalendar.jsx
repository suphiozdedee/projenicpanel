import React from 'react';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EVENTS = [
  { id: 1, title: 'Consumer Electronics Show', location: 'Las Vegas', date: 'Jan 09 - 12, 2024', type: 'Tech' },
  { id: 2, title: 'Mobile World Congress', location: 'Barcelona', date: 'Feb 26 - 29, 2024', type: 'Mobile' },
  { id: 3, title: 'Hannover Messe', location: 'Hannover', date: 'Apr 22 - 26, 2024', type: 'Industrial' },
];

function FairCalendar() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Fair Calendar</h2>
          <p className="text-slate-400">Upcoming global trade shows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300">Month View</Button>
          <Button className="bg-orange-600 hover:bg-orange-700">Add Event</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EVENTS.map((event) => (
          <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all">
            <div className="h-32 bg-slate-800 relative">
              {/* Using a solid color fallback if image loading fails conceptually, though here we use gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-medium border border-white/10">
                {event.type}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {event.location}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                      U{i}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-400">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FairCalendar;