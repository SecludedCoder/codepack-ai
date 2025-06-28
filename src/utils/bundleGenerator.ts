import { FileNode } from '../types';

export async function generateBundle(
  fileTree: FileNode | null,
  selectedFiles: Set<string>,
  getFileContent?: (path: string) => Promise<string>
): Promise<string> {
  if (!fileTree || selectedFiles.size === 0) {
    throw new Error('没有选择任何文件');
  }

  const output: string[] = [];
  const timestamp = new Date().toISOString();
  const files = Array.from(selectedFiles).sort();
  
  // 计算总大小
  let totalSize = 0;
  const fileNodes: FileNode[] = [];
  
  // 收集所有选中的文件节点
  collectSelectedNodes(fileTree, selectedFiles, fileNodes);
  totalSize = fileNodes.reduce((sum, node) => sum + node.size, 0);

  // 生成头部
  output.push('='.repeat(80));
  output.push('# 项目代码打包 - CodePack AI');
  output.push(`# 生成时间: ${timestamp}`);
  output.push(`# 文件数量: ${files.length}`);
  output.push(`# 总大小: ${formatFileSize(totalSize)}`);
  output.push(`# 项目根目录: ${fileTree.name}`);
  output.push('='.repeat(80));
  output.push('');

  // 生成文件树结构
  output.push('## 📁 包含的文件结构：');
  output.push('');
  output.push('```');
  output.push(generateTreeStructure(fileTree, selectedFiles));
  output.push('```');
  output.push('');
  output.push('='.repeat(80));
  output.push('');

  // 生成文件内容
  output.push('## 📄 文件内容：');
  output.push('');

  for (const filePath of files) {
    const fileNode = findNodeByPath(fileTree, filePath);
    if (!fileNode || fileNode.type !== 'file') continue;

    output.push(`### 文件: ${filePath}`);
    output.push('');
    
    // 检测语言类型
    const language = detectLanguage(filePath);
    output.push(`\`\`\`${language}`);
    
    try {
      // 使用传入的 getFileContent 函数获取文件内容
      if (getFileContent) {
        const content = await getFileContent(filePath);
        output.push(content);
      } else {
        output.push('[错误: 无法读取文件内容 - 未提供文件读取函数]');
      }
    } catch (err) {
      output.push(`[错误: 无法读取文件内容 - ${err}]`);
    }
    
    output.push('```');
    output.push('');
  }

  return output.join('\n');
}

// 收集选中的文件节点
function collectSelectedNodes(
  node: FileNode,
  selectedFiles: Set<string>,
  result: FileNode[]
) {
  if (node.type === 'file' && selectedFiles.has(node.path)) {
    result.push(node);
  } else if (node.type === 'directory' && node.children) {
    for (const child of Object.values(node.children)) {
      collectSelectedNodes(child, selectedFiles, result);
    }
  }
}

// 根据路径查找节点
function findNodeByPath(node: FileNode, path: string): FileNode | null {
  if (node.path === path) return node;
  
  if (node.type === 'directory' && node.children) {
    for (const child of Object.values(node.children)) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }
  
  return null;
}

// 生成文件树结构
function generateTreeStructure(
  node: FileNode,
  selectedFiles: Set<string>,
  prefix = '',
  isLast = true
): string {
  const lines: string[] = [];
  const connector = isLast ? '└── ' : '├── ';
  const isSelected = node.type === 'file' && selectedFiles.has(node.path);
  const hasSelectedChildren = hasSelectedDescendants(node, selectedFiles);
  
  // 只显示选中的文件和包含选中文件的目录
  if (!isSelected && !hasSelectedChildren) {
    return '';
  }
  
  if (node.path !== node.name) { // 跳过根节点
    const marker = isSelected ? '✓' : '';
    lines.push(`${prefix}${connector}${node.name} ${marker}`);
  }
  
  if (node.type === 'directory' && node.children) {
    const childPrefix = node.path === node.name ? '' : prefix + (isLast ? '    ' : '│   ');
    const children = Object.values(node.children);
    
    children.forEach((child, index) => {
      const childLines = generateTreeStructure(
        child,
        selectedFiles,
        childPrefix,
        index === children.length - 1
      );
      if (childLines) {
        lines.push(childLines);
      }
    });
  }
  
  return lines.filter(Boolean).join('\n');
}

// 检查是否有选中的后代节点
function hasSelectedDescendants(node: FileNode, selectedFiles: Set<string>): boolean {
  if (node.type === 'file') {
    return selectedFiles.has(node.path);
  }
  
  if (node.children) {
    return Object.values(node.children).some(child =>
      hasSelectedDescendants(child, selectedFiles)
    );
  }
  
  return false;
}

// 检测编程语言
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    // 编程语言
    'py': 'python',
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'java': 'java',
    'kt': 'kotlin',
    'scala': 'scala',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'r': 'r',
    'm': 'matlab',
    'lua': 'lua',
    'pl': 'perl',
    
    // 标记语言
    'html': 'html',
    'htm': 'html',
    'xml': 'xml',
    'vue': 'vue',
    'svelte': 'svelte',
    
    // 样式
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'styl': 'stylus',
    
    // 配置
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'conf',
    'cfg': 'cfg',
    
    // 脚本
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'fish',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    
    // 数据
    'sql': 'sql',
    'csv': 'csv',
    
    // 文档
    'md': 'markdown',
    'rst': 'rst',
    'tex': 'latex',
  };
  
  return languageMap[ext] || '';
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// 占位符函数 - 实际使用时需要从 useFileSystem hook 获取
async function getFileContentPlaceholder(path: string): Promise<string> {
  // 这里应该调用实际的文件读取函数
  return `// 文件内容: ${path}\n// 这是一个占位符，实际内容需要从文件系统读取`;
}