import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught:', error.message, info.componentStack?.slice(0, 200));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-primary)',
          flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
