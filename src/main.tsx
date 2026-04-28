import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handling to suppress common wallet/MetaMask extension errors
// that can bubble up from third-party social login libraries or injected scripts
const isWalletError = (err: any) => {
  try {
    const msg = (err?.message || err?.reason?.message || String(err)).toLowerCase();
    return msg.includes('metamask') || 
           msg.includes('ethereum') || 
           msg.includes('provider') || 
           msg.includes('inpage.js') ||
           msg.includes('wallet') ||
           msg.includes('connection') ||
           msg.includes('rpc');
  } catch (e) {
    return false;
  }
};

window.addEventListener('unhandledrejection', (event) => {
  if (isWalletError(event.reason)) {
    event.preventDefault();
    console.debug('Suppressed wallet provider rejection');
  }
});

window.addEventListener('error', (event) => {
  if (isWalletError(event.error) || isWalletError(event.message)) {
    event.preventDefault();
    console.debug('Suppressed wallet provider error');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
