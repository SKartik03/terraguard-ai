import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TerraGuard UI ErrorBoundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentView !== this.props.currentView && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel animate-fade-in" style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 640, margin: '40px auto', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', marginBottom: 16 }}>
            <AlertOctagon size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: 10 }}>
            Unable to load the risk assessment for this location right now
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 24 }}>
            Please try again. If the issue persists, select another location or inspect the area directly on the interactive map.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
            {this.props.onNavigateHome && (
              <button 
                onClick={this.props.onNavigateHome}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Home size={16} /> Choose Another Location
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
