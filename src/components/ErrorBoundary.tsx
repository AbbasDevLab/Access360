import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Something went wrong</h1>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Error:</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            {this.state.error?.stack && (
              <details style={{ marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', color: '#991b1b' }}>Stack trace</summary>
                <pre style={{ marginTop: '8px', fontSize: '12px', overflow: 'auto' }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}





