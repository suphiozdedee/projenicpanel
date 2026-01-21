
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WifiOff, Loader2, AlertTriangle, XCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

// Contexts
import { SimpleAuthProvider, useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
import { SupabaseHealthProvider, useSupabaseHealth } from '@/contexts/SupabaseHealthContext';
import { runHealthCheck } from '@/lib/supabaseHealthCheck';
import { connectionManager } from '@/lib/supabaseConnectionManager';

// Components
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Direct Imports for Critical Paths (Login)
import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';

// Lazy Loaded Pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const WorkflowPage = lazy(() => import('@/pages/WorkflowPage'));
const BrieflerPage = lazy(() => import('@/pages/BrieflerPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const FairCalendarPage = lazy(() => import('@/pages/FairCalendarPage'));
const QuotesPage = lazy(() => import('@/pages/QuotesPage'));
const OperationPage = lazy(() => import('@/pages/OperationPage'));
const CustomersPage = lazy(() => import('@/pages/CustomersPage'));
const ExportListPage = lazy(() => import('@/pages/ExportListPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const SupabaseConnectionTest = lazy(() => import('@/pages/admin/SupabaseConnectionTest'));
const DebugPage = lazy(() => import('@/pages/debug/SupabaseDebugPage'));

// --- Utility Components ---

const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ConnectionStatusIndicator = () => {
  const [status, setStatus] = useState({ online: true, connected: true });

  useEffect(() => {
    // Browser Online/Offline
    const updateOnline = () => setStatus(s => ({ ...s, online: navigator.onLine }));
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    // Supabase Connection Manager
    const unsubscribe = connectionManager.onConnectionChange((isConnected) => {
      setStatus(s => ({ ...s, connected: isConnected }));
    });

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      unsubscribe();
    };
  }, []);

  if (status.online && status.connected) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-[100] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-white transition-all duration-300
      ${!status.online ? 'bg-red-600' : 'bg-yellow-500'}
    `}>
      {!status.online ? (
        <> <WifiOff className="w-3.5 h-3.5" /> İnternet Yok </>
      ) : (
        <> <AlertTriangle className="w-3.5 h-3.5" /> Veritabanı Bağlantısı Yok </>
      )}
    </div>
  );
};

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    
    if (user?.user_metadata?.role === 'designer') return <Navigate to="/projects" replace />;
    if (user?.user_metadata?.role === 'admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
}

// --- Main App Content ---

function AppContent() {
    useEffect(() => {
      runHealthCheck();
    }, []);

    return (
        <Router>
            <ConnectionStatusIndicator />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />
                    <Route path="/debug/supabase" element={<DebugPage />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<RoleBasedRedirect />} />
                        
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="workflow" element={<WorkflowPage />} />
                        <Route path="briefs" element={<BrieflerPage />} />
                        <Route path="quotes" element={<QuotesPage />} />
                        <Route path="operations" element={<OperationPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="calendar" element={<FairCalendarPage />} />
                        <Route path="export-list" element={<ExportListPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        
                        <Route path="admin-dashboard" element={<AdminDashboard />} />
                        <Route path="admin/users" element={<AdminUsersPage />} />
                        <Route path="admin/connection-test" element={<SupabaseConnectionTest />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
            <Toaster />
        </Router>
    );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseHealthProvider>
          <AuthProvider>
            <SimpleAuthProvider>
               <TooltipProvider delayDuration={0}>
                  <AppContent />
               </TooltipProvider>
            </SimpleAuthProvider>
          </AuthProvider>
      </SupabaseHealthProvider>
    </ErrorBoundary>
  );
}

export default App;
