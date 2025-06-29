// src/hooks/useFileSystem.ts

import { useState, useCallback, useRef } from 'react';
import { FileNode } from '../types';
import { shouldIgnoreDirectory } from '../utils/presets';

export function useFileSystem() {
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileContentsRef = useRef<Map<string, File>>(new Map());

  // 检查浏览器支持
  const checkSupport = (): boolean => {
    if (!('showDirectoryPicker' in window)) {
      setError('您的浏览器不支持目录选择功能。请使用 Chrome 86+, Edge 86+, 或 Opera 72+');
      return false;
    }
    return true;
  };

  // 加载目录
  const loadDirectory = useCallback(async () => {
    if (!checkSupport()) return;

    try {
      setLoading(true);
      setError(null);
      
      fileContentsRef.current.clear();
      
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      const tree = await processDirectory(dirHandle, dirHandle.name);
      
      setFileTree(tree);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('读取目录失败: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理拖拽上传
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    fileContentsRef.current.clear();

    try {
      const items = Array.from(e.dataTransfer.items);
      const fileSystemEntries = await Promise.all(
        items
          .filter(item => item.kind === 'file')
          .map(item => (item as any).webkitGetAsEntry())
      );

      const validEntries = fileSystemEntries.filter(Boolean);
      if (validEntries.length === 0) {
        throw new Error('没有检测到有效的文件或文件夹');
      }

      const entry = validEntries[0];
      if (entry && entry.isDirectory) {
        const tree = await processWebkitDirectory(entry);
        setFileTree(tree);
      } else {
        throw new Error('请拖拽文件夹，而不是单个文件');
      }
    } catch (err: any) {
      setError('处理拖拽失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理 File System Access API 目录
  async function processDirectory(
    dirHandle: any,
    name: string,
    path: string = ''
  ): Promise<FileNode> {
    const node: FileNode = {
      name,
      path: path || name,
      type: 'directory',
      size: 0,
      children: {},
    };

    try {
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          
          fileContentsRef.current.set(entryPath, file);
          
          if (node.children) {
            node.children[entry.name] = {
              name: entry.name,
              path: entryPath,
              type: 'file',
              size: file.size,
              lastModified: file.lastModified,
            };
          }
        } else if (entry.kind === 'directory') {
          if (shouldIgnoreDirectory(entry.name)) {
            continue;
          }
          
          if (node.children) {
            node.children[entry.name] = await processDirectory(
              entry,
              entry.name,
              entryPath
            );
          }
        }
      }
    } catch (err) {
      console.error('处理目录失败:', err);
    }

    return node;
  }

  // 处理 WebKit 目录（降级方案）
  async function processWebkitDirectory(
    entry: any,
    path: string = ''
  ): Promise<FileNode> {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file: File) => {
          const filePath = path || entry.name;
          fileContentsRef.current.set(filePath, file);
          
          resolve({
            name: entry.name,
            path: filePath,
            type: 'file',
            size: file.size,
            lastModified: file.lastModified,
          });
        });
      });
    }

    if (entry.isDirectory) {
      const node: FileNode = {
        name: entry.name,
        path: path || entry.name,
        type: 'directory',
        size: 0,
        children: {},
      };
      
      const reader = entry.createReader();
      const entries = await new Promise<any[]>((resolve) => {
        const allEntries: any[] = [];
        
        function readEntries() {
          reader.readEntries((entries: any[]) => {
            if (entries.length > 0) {
              allEntries.push(...entries);
              readEntries();
            } else {
              resolve(allEntries);
            }
          });
        }
        
        readEntries();
      });

      for (const childEntry of entries) {
        const childPath = path ? `${path}/${childEntry.name}` : childEntry.name;
        
        if (childEntry.isDirectory && shouldIgnoreDirectory(childEntry.name)) {
          continue;
        }
        
        if (node.children) {
          node.children[childEntry.name] = await processWebkitDirectory(
            childEntry,
            childPath
          );
        }
      }
      
      return node;
    }

    throw new Error('Unknown entry type');
  }

  // 获取文件内容
  const getFileContent = useCallback(async (path: string): Promise<string> => {
    const file = fileContentsRef.current.get(path);
    if (!file) {
      throw new Error('文件未找到');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }, []);

  return {
    fileTree,
    loading,
    error,
    loadDirectory,
    handleDrop,
    getFileContent,
  };
}