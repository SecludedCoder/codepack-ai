// src/hooks/useFileFilters.ts

import { useCallback } from 'react';
import { FileNode, FilterConfig } from '../types';
import { useStoredFilterConfig } from './useLocalStorage';

export function useFileFilters() {
  const [filterConfig, setFilterConfig] = useStoredFilterConfig();

  const updateFilter = useCallback((newConfig: Partial<FilterConfig>) => {
    setFilterConfig(prev => ({ ...prev, ...newConfig }));
  }, [setFilterConfig]);

  const applyFilters = useCallback((
    node: FileNode | null,
    config: FilterConfig
  ): FileNode | null => {
    if (!node) return null;

    if (node.type === 'file') {
      if (node.size > config.maxFileSize) {
        return null;
      }

      for (const pattern of config.excludePatterns) {
        try {
          if (new RegExp(pattern).test(node.path)) {
            return null;
          }
        } catch (e) {
          if (node.path.includes(pattern)) {
            return null;
          }
        }
      }

      if (config.includeExtensions.length > 0 && !config.includeExtensions.includes('*')) {
        const ext = node.name.includes('.') ? `.${node.name.split('.').pop()!.toLowerCase()}` : node.name.toLowerCase();
        
        const isIncluded = config.includeExtensions.some(includeExt => {
          if (!includeExt.startsWith('.')) {
            return node.name.toLowerCase() === includeExt.toLowerCase();
          }
          return ext === includeExt;
        });

        if (!isIncluded) {
          return null;
        }
      }

      return node;
    }

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

        const ext = n.name.includes('.') ? `.${n.name.split('.').pop()!.toLowerCase()}` : 'no-extension';

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
    updateFilter,
    applyFilters,
    getFileStats,
  };
}