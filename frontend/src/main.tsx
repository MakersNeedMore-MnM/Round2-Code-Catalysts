import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a1929', color: '#fff', minHeight: '100vh' }}>
          <h1 style={{ color: '#f87171', marginBottom: 16 }}>⚠️ React Crash Detected</h1>
          <pre style={{ background: '#1e293b', padding: 20, borderRadius: 8, color: '#fca5a5', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {err.message}
            {'\n\n'}
            {err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
