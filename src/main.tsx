import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user about new content being available
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <BrowserRouter >
    <App />
  </BrowserRouter>
</React.StrictMode>,
)