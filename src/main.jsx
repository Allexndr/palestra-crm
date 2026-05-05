import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Fix for Vercel/Vite chunk loading errors (white screen after deploy)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error (chunk missing). Reloading page to fetch latest version...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
