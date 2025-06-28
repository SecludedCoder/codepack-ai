import { useState, useCallback, useMemo } from 'react';
import { FileNode, FilterConfig } from '../types';
import { useStoredFilterConfig } from './useLocalStorage';

export function useFileFilters() {
  const [filterConfig, setFilterConfig] = useStoredFilterConfig();

  const updateFilterConfig = useCallback((newConfig: FilterConfig) => {
    setFilterConfig(newConfig);
  }, [setFilterConfig]);

  const applyFilters = useCallback((
    node: FileNode | null,
    config: FilterConfig
  ): FileNode | null => {
    if (!node) return null;

    // 如果是文件，检查是否应该包含
    if (node.type === 'file') {
      // 检查文件大小
      if (node.size > config.maxFileSize) {
        return null;
      }

      // 检查排除模式
      for (const pattern of config.excludePatterns) {
        try {
          const regex = new RegExp(pattern);
          if (regex.test(node.path) || regex.test(node.name)) {
            return null;
          }
        } catch (e) {
          // 如果不是有效的正则表达式，作为普通字符串匹配
          if (node.path.includes(pattern) || node.name.includes(pattern)) {
            return null;
          }
        }
      }

      // 检查包含的扩展名
      if (config.includeExtensions.length > 0 && !config.includeExtensions.includes('*')) {
        const ext = node.name.includes('.') 
          ? '.' + node.name.split('.').pop()!.toLowerCase()
          : node.name.toLowerCase();
        
        const isIncluded = config.includeExtensions.some(includeExt => {
          // 处理特殊文件名（如 Dockerfile）
          if (!includeExt.startsWith('.')) {
            return node.name.toLowerCase() === includeExt.toLowerCase();
          }
          return ext === includeExt.toLowerCase();
        });

        if (!isIncluded) {
          return null;
        }
      }

      return node;
    }

    // 如果是目录，递归处理子节点
    if (node.type === 'directory' && node.children) {
      const filteredChildren: Record<string, FileNode> = {};
      let hasValidChildren = false;

      for (const [name, child] of Object.entries(node.children)) {
        const filteredChild = applyFilters(child, config);
        if (filteredChild) {
          filteredChildren[name] = filteredChild;
          hasValidChildren = true;
        }
      }

      // 如果目录没有有效的子节点，返回 null
      if (!hasValidChildren) {
        return null;
      }

      return {
        ...node,
        children: filteredChildren,
      };
    }

    return node;
  }, []);

  // 获取文件统计信息
  const getFileStats = useCallback((node: FileNode | null) => {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      filesByExtension: {} as Record<string, { count: number; size: number }>,
    };

    const collectStats = (n: FileNode) => {
      if (n.type === 'file') {
        stats.totalFiles++;
        stats.totalSize += n.size;

        const ext = n.name.includes('.')
          ? '.' + n.name.split('.').pop()!.toLowerCase()
          : 'no-extension';

        if (!stats.filesByExtension[ext]) {
          stats.filesByExtension[ext] = { count: 0, size: 0 };
        }
        stats.filesByExtension[ext].count++;
        stats.filesByExtension[ext].size += n.size;
      } else if (n.children) {
        Object.values(n.children).forEach(collectStats);
      }
    };

    if (node) {
      collectStats(node);
    }

    return stats;
  }, []);

  return {
    filterConfig,
    updateFilterConfig,
    applyFilters,
    getFileStats,
  };
}