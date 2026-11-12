import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/variables.css';
import './styles/stitch.css';
import App from './App.tsx';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

// Register Service Worker for Samsung S26 PWA & Evening Push Notifications
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
