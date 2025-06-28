import { PresetConfig, PresetType } from '../types';

export const PRESETS: Record<PresetType, PresetConfig> = {
  python: {
    name: 'Python 项目',
    description: '适用于 Python 项目，包含 .py 文件和配置',
    includeExtensions: [
      '.py', '.pyx', '.pyi', '.pyw',
      '.txt', '.md', '.rst',
      '.yaml', '.yml', '.toml', '.ini', '.cfg',
      '.json', '.env',
      'requirements.txt', 'Pipfile', 'setup.py', 'setup.cfg',
      'pyproject.toml', 'Dockerfile', 'Makefile'
    ],
    excludePatterns: [
      '__pycache__',
      '*.pyc',
      '.pytest_cache',
      '.coverage',
      'htmlcov',
      '.tox',
      '*.egg-info',
      'dist/',
      'build/',
      '.mypy_cache',
      '.ruff_cache',
    ],
    maxFileSize: 500 * 1024, // 500KB
  },

  javascript: {
    name: 'JavaScript 项目',
    description: '适用于 JavaScript/Node.js 项目',
    includeExtensions: [
      '.js', '.jsx', '.mjs', '.cjs',
      '.json', '.md', '.txt',
      '.env', '.env.local',
      'package.json', 'package-lock.json', 'yarn.lock',
      '.babelrc', 'webpack.config.js', 'rollup.config.js',
      '.eslintrc', '.prettierrc',
      'Dockerfile', 'docker-compose.yml'
    ],
    excludePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.cache/',
      '*.min.js',
      '*.bundle.js',
      '.next/',
      'out/',
    ],
    maxFileSize: 500 * 1024,
  },

  typescript: {
    name: 'TypeScript 项目',
    description: '适用于 TypeScript 项目',
    includeExtensions: [
      '.ts', '.tsx', '.d.ts',
      '.js', '.jsx', '.mjs', '.cjs',
      '.json', '.md', '.txt',
      '.env', '.env.local',
      'package.json', 'tsconfig.json', 'jest.config.js',
      '.eslintrc', '.prettierrc',
      'Dockerfile', 'docker-compose.yml'
    ],
    excludePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.cache/',
      '*.min.js',
      '*.bundle.js',
      '*.js.map',
      '.next/',
      'out/',
    ],
    maxFileSize: 500 * 1024,
  },

  java: {
    name: 'Java 项目',
    description: '适用于 Java/Spring 项目',
    includeExtensions: [
      '.java', '.kt', '.scala', '.groovy',
      '.xml', '.properties', '.yml', '.yaml',
      '.gradle', '.gradle.kts',
      'pom.xml', 'build.gradle', 'settings.gradle',
      'Dockerfile', 'docker-compose.yml',
      '.md', '.txt'
    ],
    excludePatterns: [
      'target/',
      'build/',
      'out/',
      '.gradle/',
      '.idea/',
      '*.class',
      '*.jar',
      '*.war',
    ],
    maxFileSize: 500 * 1024,
  },

  go: {
    name: 'Go 项目',
    description: '适用于 Go 项目',
    includeExtensions: [
      '.go', '.mod', '.sum',
      '.yaml', '.yml', '.toml', '.json',
      '.md', '.txt',
      'Dockerfile', 'docker-compose.yml',
      'Makefile'
    ],
    excludePatterns: [
      'vendor/',
      'bin/',
      'dist/',
      '*.exe',
      '*.so',
      '*.dylib',
      '*.dll',
    ],
    maxFileSize: 500 * 1024,
  },

  web: {
    name: 'Web 前端项目',
    description: '适用于 Web 前端项目（HTML/CSS/JS）',
    includeExtensions: [
      '.html', '.htm', '.xhtml',
      '.css', '.scss', '.sass', '.less', '.styl',
      '.js', '.jsx', '.ts', '.tsx',
      '.vue', '.svelte',
      '.json', '.xml', '.svg',
      '.md', '.txt',
      'package.json', '.babelrc', 'webpack.config.js',
      '.env', '.env.local'
    ],
    excludePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      '.cache/',
      '*.min.js',
      '*.min.css',
      '*.bundle.js',
      'coverage/',
    ],
    maxFileSize: 500 * 1024,
  },

  all: {
    name: '所有文件',
    description: '包含所有类型的文件（谨慎使用）',
    includeExtensions: ['*'], // 特殊标记，表示所有文件
    excludePatterns: [
      '.git/',
      'node_modules/',
      '.venv/',
      'venv/',
      '__pycache__/',
      'dist/',
      'build/',
      'target/',
      '*.exe',
      '*.dll',
      '*.so',
      '*.dylib',
      '*.zip',
      '*.tar',
      '*.gz',
      '*.rar',
      '*.7z',
      '*.mp4',
      '*.mp3',
      '*.avi',
      '*.mov',
      '*.jpg',
      '*.jpeg',
      '*.png',
      '*.gif',
      '*.bmp',
      '*.ico',
      '*.pdf',
      '*.doc',
      '*.docx',
      '*.xls',
      '*.xlsx',
      '*.ppt',
      '*.pptx',
    ],
    maxFileSize: 1024 * 1024, // 1MB
  },

  custom: {
    name: '自定义',
    description: '自定义过滤规则',
    includeExtensions: [],
    excludePatterns: [],
    maxFileSize: 500 * 1024,
  },
};

// 获取文件图标
export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const name = filename.toLowerCase();

  // 特殊文件
  const specialFiles: Record<string, string> = {
    'dockerfile': '🐳',
    'docker-compose.yml': '🐳',
    'docker-compose.yaml': '🐳',
    'package.json': '📦',
    'package-lock.json': '🔒',
    'yarn.lock': '🔒',
    'requirements.txt': '📋',
    'pipfile': '📋',
    'makefile': '🔧',
    '.gitignore': '🚫',
    '.env': '🔐',
    'readme.md': '📖',
    'license': '⚖️',
  };

  if (specialFiles[name]) {
    return specialFiles[name];
  }

  // 扩展名映射
  const extIcons: Record<string, string> = {
    // 编程语言
    'py': '🐍',
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'java': '☕',
    'kt': '🟪',
    'go': '🐹',
    'rs': '🦀',
    'c': '🔵',
    'cpp': '🔷',
    'cs': '🟦',
    'php': '🐘',
    'rb': '💎',
    'swift': '🍎',
    'r': '📊',
    'scala': '🔴',
    
    // 标记语言
    'html': '🌐',
    'htm': '🌐',
    'xml': '📄',
    'vue': '💚',
    'svelte': '🧡',
    
    // 样式
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'less': '🎨',
    'styl': '🎨',
    
    // 配置
    'json': '📋',
    'yaml': '📋',
    'yml': '📋',
    'toml': '📋',
    'ini': '⚙️',
    'conf': '⚙️',
    'cfg': '⚙️',
    
    // 文档
    'md': '📝',
    'txt': '📄',
    'rst': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    
    // 数据
    'csv': '📊',
    'sql': '🗃️',
    'db': '🗄️',
    
    // 脚本
    'sh': '💻',
    'bash': '💻',
    'zsh': '💻',
    'fish': '💻',
    'ps1': '💻',
    'bat': '💻',
    'cmd': '💻',
    
    // 图像
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',
    
    // 压缩
    'zip': '🗜️',
    'tar': '🗜️',
    'gz': '🗜️',
    'rar': '🗜️',
    '7z': '🗜️',
  };

  return extIcons[ext] || '📄';
}