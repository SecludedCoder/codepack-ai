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

// 辅助函数，检查节点或其任何后代是否匹配搜索词
function hasMatchingDescendant(node: FileNode, searchTerm: string): boolean {
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  if (node.name.toLowerCase().includes(lowerCaseSearchTerm)) {
    return true;
  }
  
  if (node.type === 'directory' && node.children) {
    return Object.values(node.children).some(child => hasMatchingDescendant(child, lowerCaseSearchTerm));
  }
  
  return false;
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

  // 修复 #1: 确保 isMatched 始终是布尔类型
  const isMatched =
    !!(searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 如果有搜索词，但当前节点及其所有子节点都不匹配，则不渲染该节点
  if (searchTerm && !hasMatchingDescendant(node, searchTerm)) {
    return null;
  }

  const handleToggle = () => {
    if (node.type === 'directory') {
      onToggleExpand(node.path);
    }
  };
  
  return (
    <div className={styles.treeNode}>
      <FileNodeComponent
        node={node}
        isSelected={selectedFiles.has(node.path)}
        isExpanded={isExpanded}
        isMatched={isMatched}
        level={level}
        // 修复 #2: 直接传递 onFileSelect 函数
        onSelect={onFileSelect}
        onToggle={handleToggle}
      />
      
      {isExpanded && node.type === 'directory' && node.children && (
        <div className={styles.children}>
          {Object.values(node.children)
            .sort((a, b) => {
              // 目录优先
              if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
              }
              // 按名称排序
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
            ))
          }
        </div>
      )}
    </div>
  );
};