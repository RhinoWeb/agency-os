import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '2rem',
        fontFamily: 'var(--sans)',
      }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '2.5rem', maxWidth: '480px',
          width: '100%', textAlign: 'center',
        }}>
          <div style={{
            fontSize: '2rem', marginBottom: '0.75rem',
            color: 'var(--red)', fontWeight: 700,
          }}>
            Something went wrong
          </div>
          <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            An unexpected error crashed this view. You can reload the page to recover.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--red)', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '0.6rem 1.5rem', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            Reload
          </button>
          <div style={{ marginTop: '1.25rem' }}>
            <button
              onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.8rem',
                textDecoration: 'underline',
              }}
            >
              {this.state.showDetails ? 'Hide details' : 'Show details'}
            </button>
            {this.state.showDetails && (
              <pre style={{
                marginTop: '0.75rem', padding: '0.75rem', borderRadius: '6px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.75rem',
                textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                maxHeight: '200px', overflow: 'auto',
              }}>
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
}
