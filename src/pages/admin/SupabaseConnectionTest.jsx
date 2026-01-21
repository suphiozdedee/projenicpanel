
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Database } from 'lucide-react';
import { runDiagnostics } from '@/lib/supabaseConnectionDiagnostics';

const StatusBadge = ({ status }) => {
  if (status === 'ok') return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</Badge>;
  if (status === 'error') return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
  return <Badge variant="outline" className="text-zinc-500">Unknown</Badge>;
};

export default function SupabaseConnectionTest() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const results = await runDiagnostics();
      setReport(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-[#0A0A0A] p-6 rounded-lg border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Veritabanı Bağlantı Testi</h1>
          <p className="text-zinc-400 text-sm">Supabase bağlantı durumunu ve tablo erişimlerini kontrol edin.</p>
        </div>
        <Button onClick={runTest} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
           {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
           Testi Çalıştır
        </Button>
      </div>

      {report && (
        <div className="grid gap-6">
          {/* Summary Card */}
          <Card className="bg-[#121212] border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Genel Durum: 
                <span className={`uppercase ${
                  report.overallStatus === 'success' ? 'text-green-500' : 
                  report.overallStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {report.overallStatus}
                </span>
              </CardTitle>
              <CardDescription>
                Test Zamanı: {new Date(report.timestamp).toLocaleString()} | Gecikme: {report.latency}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>Client Init</span>
                  {report.clientInit ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>API Key Config</span>
                  {report.apiKeyConfig ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>Network Reachable</span>
                  {report.networkReachable ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables Details */}
          <Card className="bg-[#121212] border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Database className="w-5 h-5 text-blue-500" />
                 Tablo Erişim Kontrolü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {Object.entries(report.tables).map(([table, status]) => (
                   <div key={table} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg capitalize">{table}</span>
                        <span className="text-xs text-zinc-500">public.{table}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {status.error ? (
                          <span className="text-red-400 text-sm max-w-md truncate" title={status.error}>
                             {status.error}
                          </span>
                        ) : (
                           <span className="text-zinc-400 text-sm">
                             {status.count !== undefined ? `${status.count} kayıt` : '-'}
                           </span>
                        )}
                        <StatusBadge status={status.status} />
                      </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {report.fatalError && (
             <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                   <h4 className="font-bold">Kritik Hata</h4>
                   <p>{report.fatalError}</p>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
