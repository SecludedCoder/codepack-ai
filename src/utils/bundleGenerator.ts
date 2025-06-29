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

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
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
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'scala': 'scala',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'ps1': 'powershell',
    'r': 'r',
    'R': 'r',
    'sql': 'sql',
    'html': 'html',
    'htm': 'html',
    'xml': 'xml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    'md': 'markdown',
    'markdown': 'markdown',
    'rst': 'rst',
    'tex': 'latex',
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'mk': 'makefile',
    'asm': 'assembly',
    's': 'assembly',
    'pl': 'perl',
    'lua': 'lua',
    'vim': 'vim',
    'diff': 'diff',
    'patch': 'diff',
  };
  
  // 特殊文件名
  const fileName = filePath.split('/').pop()?.toLowerCase() || '';
  if (fileName === 'dockerfile') return 'dockerfile';
  if (fileName === 'makefile' || fileName === 'gnumakefile') return 'makefile';
  if (fileName === 'rakefile') return 'ruby';
  if (fileName === 'gemfile') return 'ruby';
  if (fileName === 'cmakelists.txt') return 'cmake';
  if (fileName === 'package.json') return 'json';
  if (fileName === 'tsconfig.json') return 'json';
  if (fileName === '.gitignore') return 'gitignore';
  if (fileName === '.env') return 'dotenv';
  
  return languageMap[ext] || 'text';
}