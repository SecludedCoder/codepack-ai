import React from 'react';
import { QuickActions } from './QuickActions';
import styles from './styles.module.css';

interface ActionPanelProps {
  selectedCount: number;
  totalCount: number;
  onGenerate: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isGenerating: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedCount,
  totalCount,
  onGenerate,
  onSelectAll,
  onDeselectAll,
  isGenerating,
}) => {
  const hasSelection = selectedCount > 0;
  
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>📊 统计信息</h2>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>总文件数</span>
          <span className={styles.statValue}>{totalCount}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>已选择</span>
          <span className={styles.statValue}>{selectedCount}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>选择率</span>
          <span className={styles.statValue}>
            {totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: totalCount > 0 ? `${(selectedCount / totalCount) * 100}%` : '0%' 
          }}
        />
      </div>
      
      <QuickActions
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        hasSelection={hasSelection}
      />
      
      <button
        className={`${styles.generateButton} ${!hasSelection ? styles.disabled : ''}`}
        onClick={onGenerate}
        disabled={!hasSelection || isGenerating}
      >
        {isGenerating ? (
          <>
            <span className={styles.spinner}></span>
            生成中...
          </>
        ) : (
          <>
            🚀 生成打包文件
          </>
        )}
      </button>
      
      {!hasSelection && (
        <p className={styles.hint}>
          请至少选择一个文件
        </p>
      )}
    </div>
  );
};