// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 错误已修复：将导入路径从 './index.css' 修改为 './styles/globals.css'
import './styles/globals.css';

// Detect if running in development mode
const isDevelopment = import.meta.env.DEV;

// Mount the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Show console message in development
if (isDevelopment) {
  console.log(
    '%cCodePack AI',
    'color: #3b82f6; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cBundle your code for AI assistants',
    'color: #6b7280; font-size: 14px;'
  );
}

// Register service worker for production
if ('serviceWorker' in navigator && !isDevelopment) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}