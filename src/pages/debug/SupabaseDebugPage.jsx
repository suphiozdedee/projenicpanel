
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { runHealthCheck } from '@/lib/supabaseHealthCheck';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { RefreshCw, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export default function SupabaseDebugPage() {
  const { session, user } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const result = await runHealthCheck();
    setHealth(result);
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-orange-500" />
            Sistem Tanı Aracı (Debug)
        </h1>
        <Button onClick={runTest} disabled={loading} variant="outline">
           {loading ? <RefreshCw className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />} 
           Testi Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment */}
          <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader><CardTitle>Environment Variables</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between">
                      <span>VITE_SUPABASE_URL</span>
                      <Badge variant={health?.env.url ? "default" : "destructive"}>
                          {health?.env.url ? "Loaded" : "Missing"}
                      </Badge>
                  </div>
                  <div className="flex justify-between">
                      <span>VITE_SUPABASE_ANON_KEY</span>
                      <Badge variant={health?.env.key ? "default" : "destructive"}>
                          {health?.env.key ? "Loaded" : "Missing"}
                      </Badge>
                  </div>
              </CardContent>
          </Card>

          {/* Connection Status */}
          <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader><CardTitle>Bağlantı Durumu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                      <span>Supabase API</span>
                      {health?.connection ? (
                          <div className="flex items-center text-green-500 font-bold gap-2"><CheckCircle2 className="w-5 h-5" /> Connected ({health.latency}ms)</div>
                      ) : (
                          <div className="flex items-center text-red-500 font-bold gap-2"><XCircle className="w-5 h-5" /> Disconnected</div>
                      )}
                  </div>
              </CardContent>
          </Card>

          {/* Auth State */}
          <Card className="bg-zinc-900 border-zinc-800 text-white col-span-full">
              <CardHeader><CardTitle>Kimlik Doğrulama (Auth)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                          <div className="text-sm text-zinc-500 mb-1">Session Status</div>
                          <div className="font-mono text-sm">{session ? "Active" : "No Session"}</div>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                          <div className="text-sm text-zinc-500 mb-1">User Role</div>
                          <div className="font-mono text-sm">{user?.role || "N/A"}</div>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800 col-span-2">
                          <div className="text-sm text-zinc-500 mb-1">Access Token (Last 10 chars)</div>
                          <div className="font-mono text-xs break-all">
                              {session?.access_token ? `...${session.access_token.slice(-10)}` : "None"}
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>

          {/* RLS Policy Check */}
          <Card className="bg-zinc-900 border-zinc-800 text-white col-span-full">
              <CardHeader><CardTitle>RLS & İzinler</CardTitle></CardHeader>
              <CardContent>
                  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded border border-zinc-800">
                      <div>
                          <h4 className="font-bold">Okuma İzni Testi (Profiles Table)</h4>
                          <p className="text-sm text-zinc-400">Veritabanından veri okumayı dener.</p>
                      </div>
                      <Badge className={health?.rls ? "bg-green-600" : "bg-red-600"}>
                          {health?.rls ? "Başarılı" : "Erişim Reddedildi"}
                      </Badge>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
