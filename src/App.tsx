// src/App.tsx

import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FileExplorer } from './components/FileExplorer';
import { FilterPanel } from './components/FilterPanel';
import { ActionPanel } from './components/ActionPanel';
import { OutputPreview } from './components/OutputPreview';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { useFileSystem } from './hooks/useFileSystem';
import { useFileFilters } from './hooks/useFileFilters';
import { generateBundle } from './utils/bundleGenerator';
import { FileNode } from './types';
import './styles/globals.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [outputContent, setOutputContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { fileTree, loading, error, loadDirectory, handleDrop, getFileContent } = useFileSystem();
  const { filterConfig, updateFilter, applyFilters } = useFileFilters();

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

  const handleSelectAll = useCallback((paths: string[]) => {
    setSelectedFiles(new Set(paths));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedFiles.size === 0) {
      alert('请至少选择一个文件');
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateBundle(fileTree, selectedFiles, getFileContent);
      setOutputContent(content);
      setCopied(false);
    } catch (err) {
      console.error('生成失败:', err);
      alert('生成打包文件失败');
    } finally {
      setIsGenerating(false);
    }
  }, [fileTree, selectedFiles, getFileContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([outputContent], { type: 'text/plain;charset=utf-8' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    saveAs(blob, `codepack_${timestamp}.txt`);
  }, [outputContent]);

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard) {
      alert('您的浏览器不支持剪贴板 API');
      return;
    }
    try {
      await navigator.clipboard.writeText(outputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制到剪贴板失败');
    }
  }, [outputContent]);

  const filteredTree = applyFilters(fileTree, filterConfig);

  const getAllFilePaths = (node: FileNode | null): string[] => {
    if (!node) return [];
    const paths: string[] = [];
    const traverse = (n: FileNode) => {
      if (n.type === 'file') {
        paths.push(n.path);
      } else if (n.children) {
        Object.values(n.children).forEach(traverse);
      }
    };
    traverse(node);
    return paths;
  };
  
  const allFilteredFilePaths = getAllFilePaths(filteredTree);

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="sidebar">
          <FilterPanel
            filterConfig={filterConfig}
            onFilterUpdate={updateFilter}
            fileTree={fileTree}
          />
          
          <ActionPanel
            selectedCount={selectedFiles.size}
            totalCount={allFilteredFilePaths.length}
            onGenerate={handleGenerate}
            onSelectAll={() => handleSelectAll(allFilteredFilePaths)}
            onDeselectAll={handleDeselectAll}
            isGenerating={isGenerating}
          />
        </div>

        <div className="content">
          {!fileTree && !loading ? (
            <div 
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="drop-zone-content">
                <h2>?? 选择项目目录</h2>
                <p>拖拽文件夹到此处，或点击下方按钮选择</p>
                <button 
                  className="select-button"
                  onClick={loadDirectory}
                  disabled={loading}
                >
                  {loading ? '加载中...' : '选择目录'}
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
              isLoading={loading}
              error={error}
            />
          )}
        </div>

        {outputContent && (
          <OutputPreview
            output={outputContent}
            onClose={() => setOutputContent('')}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copied}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;