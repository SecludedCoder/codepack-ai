import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// 检查浏览器兼容性
const checkBrowserCompatibility = () => {
  const isChromium = 'showDirectoryPicker' in window;
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (!isChromium) {
    console.warn(
      '您的浏览器不完全支持 File System Access API。' +
      '推荐使用 Chrome 86+, Edge 86+, 或 Opera 72+ 以获得最佳体验。'
    );
  }
  
  return isChromium;
};

// 初始化应用
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 浏览器兼容性检查
checkBrowserCompatibility();

// 注册键盘快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + O: 打开目录
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    // 触发打开目录的事件
    window.dispatchEvent(new CustomEvent('open-directory'));
  }
});

// 注册 Service Worker (PWA)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration);
      })
      .catch((error) => {
        console.log('Service Worker 注册失败:', error);
      });
  });
}