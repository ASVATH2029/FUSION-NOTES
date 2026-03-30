import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


// Service Worker Crusher: Unregister all service workers to fix the "White Screen" caching issue
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Unregistered broken service worker');
    }
    // Only reload if we actually found and unregistered something
    if (registrations.length > 0) window.location.reload();
  });
}
