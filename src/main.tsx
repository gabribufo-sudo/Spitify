import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ChromeDownloadSite } from './components/ChromeDownloadSite';
import './index.css';

registerSW({ immediate: true });

const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
const isDownloadSiteRoute =
  pathname === '/scarica' ||
  pathname === '/scarica/' ||
  pathname === '/download' ||
  pathname === '/download/' ||
  pathname === '/install' ||
  pathname === '/install/';

createRoot(document.getElementById('root')!).render(
  isDownloadSiteRoute ? <ChromeDownloadSite /> : <App />
);
