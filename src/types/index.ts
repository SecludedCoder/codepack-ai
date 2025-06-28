// 文件节点类型
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  lastModified?: number;
  children?: Record<string, FileNode>;
}

// 过滤配置
export interface FilterConfig {
  // 文件大小限制（字节）
  maxFileSize: number;
  
  // 包含的文件扩展名
  includeExtensions: string[];
  
  // 排除的文件模式（正则表达式）
  excludePatterns: string[];
  
  // 预设名称
  preset?: PresetType;
}

// 预设类型
export type PresetType = 
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'go'
  | 'web'
  | 'all'
  | 'custom';

// 预设配置
export interface PresetConfig {
  name: string;
  description: string;
  includeExtensions: string[];
  excludePatterns: string[];
  maxFileSize: number;
}

// 文件统计
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByExtension: Record<string, {
    count: number;
    size: number;
  }>;
}

// 导出配置
export interface ExportConfig {
  selectedFiles: string[];
  filterConfig: FilterConfig;
  timestamp: string;
  version: string;
}