import React from 'react';
import styles from './styles.module.css';

interface QuickActionsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  hasSelection: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAll,
  onDeselectAll,
  hasSelection,
}) => {
  return (
    <div className={styles.quickActions}>
      <h3 className={styles.actionsTitle}>快速操作</h3>
      
      <div className={styles.actionButtons}>
        <button
          className={styles.actionButton}
          onClick={onSelectAll}
        >
          ✅ 全选
        </button>
        
        <button
          className={styles.actionButton}
          onClick={onDeselectAll}
          disabled={!hasSelection}
        >
          ❌ 取消全选
        </button>
      </div>
      
      <div className={styles.shortcuts}>
        <h4 className={styles.shortcutsTitle}>键盘快捷键</h4>
        <ul className={styles.shortcutList}>
          <li>
            <kbd>Ctrl/Cmd + A</kbd>
            <span>全选</span>
          </li>
          <li>
            <kbd>Ctrl/Cmd + D</kbd>
            <span>取消全选</span>
          </li>
          <li>
            <kbd>Ctrl/Cmd + F</kbd>
            <span>搜索文件</span>
          </li>
          <li>
            <kbd>Enter</kbd>
            <span>生成打包</span>
          </li>
        </ul>
      </div>
    </div>
  );
};