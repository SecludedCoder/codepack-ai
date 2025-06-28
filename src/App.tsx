import React, { useState, useCallback } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { FilterPanel } from './components/FilterPanel';
import { ActionPanel } from './components/ActionPanel';
import { OutputPreview } from './components/OutputPreview';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { useFileSystem } from './hooks/useFileSystem';
import { useFileFilters } from './hooks/useFileFilters';
import { generateBundle } from './utils/bundleGenerator';
import { FileNode, FilterConfig } from './types';
import './styles/globals.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [outputContent, setOutputContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { 
    fileTree, 
    isLoading, 
    error, 
    loadDirectory,
    handleDrop,
    getFileContent 
  } = useFileSystem();
  
  const {
    filterConfig,
    updateFilterConfig,
    applyFilters
  } = useFileFilters();

  // 处理文件选择
  const handleFileSelect = useCallback((path: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  }, []);

  // 批量选择
  const handleSelectAll = useCallback((paths: string[]) => {
    setSelectedFiles(prev => new Set([...prev, ...paths]));
  }, []);

  // 批量取消选择
  const handleDeselectAll = useCallback((paths: string[]) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      paths.forEach(path => newSet.delete(path));
      return newSet;
    });
  }, []);

  // 生成打包文件
  const handleGenerate = useCallback(async () => {
    if (selectedFiles.size === 0) {
      alert('请至少选择一个文件');
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateBundle(fileTree, selectedFiles, getFileContent);
      setOutputContent(content);
      
      // 自动下载
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.href = url;
      a.download = `codepack_${timestamp}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('生成失败:', err);
      alert('生成打包文件失败');
    } finally {
      setIsGenerating(false);
    }
  }, [fileTree, selectedFiles]);

  // 应用过滤器
  const filteredTree = applyFilters(fileTree, filterConfig);

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="sidebar">
          <FilterPanel
            config={filterConfig}
            onChange={updateFilterConfig}
            fileTree={fileTree}
          />
          
          <ActionPanel
            selectedCount={selectedFiles.size}
            totalCount={countFiles(filteredTree)}
            onGenerate={handleGenerate}
            onSelectAll={() => handleSelectAll(getAllPaths(filteredTree))}
            onDeselectAll={() => handleDeselectAll(getAllPaths(filteredTree))}
            isGenerating={isGenerating}
          />
        </div>

        <div className="content">
          {!fileTree ? (
            <div 
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="drop-zone-content">
                <h2>📁 选择项目目录</h2>
                <p>拖拽文件夹到此处，或点击下方按钮选择</p>
                <button 
                  className="select-button"
                  onClick={loadDirectory}
                >
                  选择目录
                </button>
                <p className="hint">
                  支持 Chrome 86+, Edge 86+, Opera 72+ 浏览器
                </p>
              </div>
            </div>
          ) : (
            <FileExplorer
              fileTree={filteredTree}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {outputContent && (
          <OutputPreview
            content={outputContent}
            onClose={() => setOutputContent('')}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

// 辅助函数
function countFiles(node: FileNode | null): number {
  if (!node) return 0;
  if (node.type === 'file') return 1;
  
  let count = 0;
  for (const child of Object.values(node.children || {})) {
    count += countFiles(child);
  }
  return count;
}

function getAllPaths(node: FileNode | null, paths: string[] = []): string[] {
  if (!node) return paths;
  if (node.type === 'file') {
    paths.push(node.path);
    return paths;
  }
  
  for (const child of Object.values(node.children || {})) {
    getAllPaths(child, paths);
  }
  return paths;
}

export default App;