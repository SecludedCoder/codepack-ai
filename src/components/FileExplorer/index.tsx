import React, { useState, useCallback } from 'react';
import { FileNode } from '../../types';
import { FileTree } from './FileTree';
import styles from './styles.module.css';

interface FileExplorerProps {
  fileTree: FileNode | null;
  selectedFiles: Set<string>;
  onFileSelect: (path: string, selected: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileTree,
  selectedFiles,
  onFileSelect,
  isLoading,
  error,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allDirs = new Set<string>();
    const collectDirs = (node: FileNode) => {
      if (node.type === 'directory') {
        allDirs.add(node.path);
        if (node.children) {
          Object.values(node.children).forEach(collectDirs);
        }
      }
    };
    if (fileTree) collectDirs(fileTree);
    setExpandedDirs(allDirs);
  }, [fileTree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedDirs(new Set());
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>正在加载文件...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!fileTree) {
    return null;
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="搜索文件..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.actions}>
          <button onClick={handleExpandAll} className={styles.toolButton}>
            展开全部
          </button>
          <button onClick={handleCollapseAll} className={styles.toolButton}>
            折叠全部
          </button>
        </div>
      </div>
      
      <div className={styles.treeContainer}>
        <FileTree
          node={fileTree}
          selectedFiles={selectedFiles}
          expandedDirs={expandedDirs}
          searchTerm={searchTerm}
          onFileSelect={onFileSelect}
          onToggleExpand={handleToggleExpand}
          level={0}
        />
      </div>
    </div>
  );
};