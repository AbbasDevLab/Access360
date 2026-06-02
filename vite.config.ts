import { defineConfig } from 'vite'

// Dev server proxies `/api/*` → the production backend, so the browser sees
// same-origin requests and CORS doesn't apply. In a production build the app
// hits the absolute backend URL directly (see src/data/global.ts).
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://server.access360.site:88',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
