import React from 'react';
import { FileNode } from '../../types';
import { FileNodeComponent } from './FileNode';
import styles from './styles.module.css';

interface FileTreeProps {
  node: FileNode;
  selectedFiles: Set<string>;
  expandedDirs: Set<string>;
  searchTerm: string;
  onFileSelect: (path: string, selected: boolean) => void;
  onToggleExpand: (path: string) => void;
  level: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  node,
  selectedFiles,
  expandedDirs,
  searchTerm,
  onFileSelect,
  onToggleExpand,
  level,
}) => {
  const isExpanded = expandedDirs.has(node.path);
  const isSelected = selectedFiles.has(node.path);
  const isMatched = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  // 检查是否有匹配的子节点
  const hasMatchingChildren = (n: FileNode): boolean => {
    if (n.type === 'file') {
      return n.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (n.children) {
      return Object.values(n.children).some(hasMatchingChildren);
    }
    return false;
  };

  const shouldShow = !searchTerm || isMatched || hasMatchingChildren(node);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.treeNode}>
      <FileNodeComponent
        node={node}
        isSelected={isSelected}
        isExpanded={isExpanded}
        isMatched={isMatched}
        level={level}
        onSelect={(selected) => onFileSelect(node.path, selected)}
        onToggle={() => onToggleExpand(node.path)}
      />
      
      {node.type === 'directory' && node.children && isExpanded && (
        <div className={styles.children}>
          {Object.values(node.children)
            .sort((a, b) => {
              // 目录优先，然后按名称排序
              if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            })
            .map(child => (
              <FileTree
                key={child.path}
                node={child}
                selectedFiles={selectedFiles}
                expandedDirs={expandedDirs}
                searchTerm={searchTerm}
                onFileSelect={onFileSelect}
                onToggleExpand={onToggleExpand}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};