import React from 'react';
import styles from './styles.module.css';

interface OutputPreviewProps {
  output: string;
  onCopy: () => Promise<void>;
  onDownload: () => void;
  onClose: () => void;
  copied: boolean;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({
  output,
  onCopy,
  onDownload,
  onClose,
  copied,
}) => {
  const lines = output.split('\n').length;
  const size = new Blob([output]).size;
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
            onClick={onCopy}
          >
            {copied ? '✓ 已复制' : '📋 复制到剪贴板'}
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={onDownload}
          >
            💾 下载文件
          </button>
        </div>
        
        <pre className={styles.preview}>
          {output}
        </pre>
      </div>
    </div>
  );
};