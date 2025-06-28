import React from 'react';
import { FileNode } from '../../types';
import { getFileIcon } from '../../utils/presets';
import { formatFileSize } from '../../utils/bundleGenerator';
import styles from './styles.module.css';

interface FileNodeComponentProps {
  node: FileNode;
  isSelected: boolean;
  isExpanded: boolean;
  isMatched: boolean;
  level: number;
  onSelect: (selected: boolean) => void;
  onToggle: () => void;
}

export const FileNodeComponent: React.FC<FileNodeComponentProps> = ({
  node,
  isSelected,
  isExpanded,
  isMatched,
  level,
  onSelect,
  onToggle,
}) => {
  const indent = level * 20;
  const icon = node.type === 'directory' 
    ? (isExpanded ? '📂' : '📁')
    : getFileIcon(node.name);

  const handleClick = () => {
    if (node.type === 'directory') {
      onToggle();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(e.target.checked);
  };

  return (
    <div 
      className={`${styles.nodeItem} ${isMatched ? styles.matched : ''}`}
      style={{ paddingLeft: `${indent}px` }}
      onClick={handleClick}
    >
      {node.type === 'directory' && (
        <span className={styles.arrow}>
          {isExpanded ? '▼' : '▶'}
        </span>
      )}
      
      {node.type === 'file' && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className={styles.checkbox}
        />
      )}
      
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{node.name}</span>
      
      {node.type === 'file' && (
        <span className={styles.size}>{formatFileSize(node.size)}</span>
      )}
    </div>
  );
};