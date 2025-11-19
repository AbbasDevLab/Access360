import React from 'react'
import ReactDOM from 'react-dom/client'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Minimal test - just render a simple div
ReactDOM.createRoot(rootElement).render(
  <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
    <h1 style={{ color: '#2563eb' }}>Test Page - App is Working!</h1>
    <p>If you see this, React is rendering correctly.</p>
    <p>Now checking the full app...</p>
  </div>
)


