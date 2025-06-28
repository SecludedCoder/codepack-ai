import React, { useState } from 'react';
import styles from './styles.module.css';

interface OutputPreviewProps {
  content: string;
  onClose: () => void;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({
  content,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  
  const lines = content.split('\n').length;
  const size = new Blob([content]).size;
  const sizeText = size < 1024 
    ? `${size} B` 
    : size < 1024 * 1024 
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>📄 预览生成的打包文件</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className={styles.info}>
          <span>行数: {lines}</span>
          <span>大小: {sizeText}</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.actionButton} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 已复制' : '📋 复制到剪贴板'}
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={() => {
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
              a.href = url;
              a.download = `codepack_${timestamp}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            💾 下载文件
          </button>
        </div>
        
        <pre className={styles.preview}>
          {content}
        </pre>
      </div>
    </div>
  );
};