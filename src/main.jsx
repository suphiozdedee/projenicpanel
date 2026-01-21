
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Root level error boundary to catch app-wide crashes
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Root Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          color: '#e4e4e7',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444' }}>
            Uygulama Başlatılamadı
          </h1>
          <p style={{ marginBottom: '2rem', color: '#a1a1aa' }}>
            Beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ea580c',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Sayfayı Yenile
          </button>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#18181b', borderRadius: '0.5rem', maxWidth: '80%', overflow: 'auto', fontSize: '0.75rem', color: '#ef4444' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </>
);
