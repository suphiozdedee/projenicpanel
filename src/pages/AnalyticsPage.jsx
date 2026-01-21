import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BarChart = ({ data }) => (
  <div className="h-[300px] w-full flex items-end justify-between gap-4 pt-8 pb-2 px-4">
    {data.map((item, i) => (
      <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
        <div 
          className="w-full bg-indigo-500/80 rounded-t-sm group-hover:bg-indigo-400 transition-all relative"
          style={{ height: `${item.value}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.value}%
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium">{item.label}</span>
      </div>
    ))}
  </div>
);

const LineChartMock = () => (
  <div className="h-[300px] w-full relative overflow-hidden pt-8">
     <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M0,80 Q10,70 20,75 T40,60 T60,40 T80,30 T100,20 V100 H0 Z" 
          fill="url(#gradient)" 
        />
        <path 
          d="M0,80 Q10,70 20,75 T40,60 T60,40 T80,30 T100,20" 
          fill="none" 
          stroke="#6366f1" 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="20" cy="75" r="1.5" fill="#fff" stroke="#6366f1" strokeWidth="0.5" />
        <circle cx="40" cy="60" r="1.5" fill="#fff" stroke="#6366f1" strokeWidth="0.5" />
        <circle cx="60" cy="40" r="1.5" fill="#fff" stroke="#6366f1" strokeWidth="0.5" />
        <circle cx="80" cy="30" r="1.5" fill="#fff" stroke="#6366f1" strokeWidth="0.5" />
     </svg>
     <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-400 px-2">
       <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
     </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Detailed performance metrics and reports.</p>
      </div>

      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-950/50 p-1">
          <TabsTrigger value="traffic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">Traffic</TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">Engagement</TabsTrigger>
          <TabsTrigger value="retention" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
               <CardHeader>
                 <CardTitle>Visitors Overview</CardTitle>
                 <CardDescription>Daily unique visitors</CardDescription>
               </CardHeader>
               <CardContent>
                 <LineChartMock />
               </CardContent>
             </Card>

             <Card className="lg:col-span-2">
               <CardHeader>
                 <CardTitle>Traffic Sources</CardTitle>
                 <CardDescription>Where your users are coming from</CardDescription>
               </CardHeader>
               <CardContent>
                  <BarChart data={[
                    { label: 'Direct', value: 35 },
                    { label: 'Social', value: 55 },
                    { label: 'Organic', value: 75 },
                    { label: 'Referral', value: 20 },
                    { label: 'Email', value: 45 },
                    { label: 'Ads', value: 60 },
                  ]} />
               </CardContent>
             </Card>
          </div>
        </TabsContent>
        <TabsContent value="engagement">
          <Card>
            <CardHeader><CardTitle>Engagement Metrics</CardTitle></CardHeader>
            <CardContent><p className="text-slate-500">Engagement data visualization would go here.</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention">
          <Card>
            <CardHeader><CardTitle>Retention Analysis</CardTitle></CardHeader>
            <CardContent><p className="text-slate-500">Retention cohorts would be displayed here.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}