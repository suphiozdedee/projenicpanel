
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, WifiOff, FileWarning } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error captured by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Clear caches that might be causing issues
    if (window.caches) {
        try {
            window.caches.keys().then(names => {
                for (let name of names) window.caches.delete(name);
            });
        } catch(e) { console.error("Cache clear failed", e); }
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || '';
      
      // Determine error type
      const isNetworkError = errorMsg.includes('fetch') || 
                             errorMsg.includes('network') ||
                             errorMsg.includes('timeout') ||
                             errorMsg.includes('CORS');
                             
      const isChunkError = errorMsg.includes('Loading chunk') || 
                           errorMsg.includes('undefined is not a function');

      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
             
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-red-500/20">
                {isNetworkError ? (
                    <WifiOff className="w-8 h-8 text-red-500" />
                ) : isChunkError ? (
                    <FileWarning className="w-8 h-8 text-amber-500" />
                ) : (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                )}
              </div>
              <CardTitle className="text-xl font-bold text-white">
                {isNetworkError ? 'Bağlantı Hatası' : 
                 isChunkError ? 'Uygulama Güncellendi' : 
                 'Beklenmedik Bir Hata'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-zinc-400 text-sm leading-relaxed">
                {isNetworkError 
                  ? 'Uygulama sunuculara ulaşamıyor. İnternet bağlantınızı kontrol edin veya güvenlik duvarı ayarlarınızı gözden geçirin.'
                  : isChunkError 
                  ? 'Uygulamanın yeni bir sürümü mevcut olabilir. Sayfayı yenilemek sorunu çözecektir.'
                  : 'İşlem sırasında beklenmedik bir hata oluştu.'}
              </p>
              
              {isDevelopment && this.state.error && (
                <div className="mt-4 p-3 bg-black/50 rounded text-left overflow-auto max-h-32 border border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700">
                  <p className="text-[10px] text-red-300 font-mono break-all font-bold mb-1">DEV MODE ERROR DETAILS:</p>
                  <code className="text-[10px] text-zinc-400 font-mono break-all">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <Button 
                onClick={this.handleReload} 
                className="w-full bg-[#FF6200] hover:bg-[#FF8000] text-white font-bold"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isChunkError ? 'Uygulamayı Güncelle' : 'Sayfayı Yenile'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
