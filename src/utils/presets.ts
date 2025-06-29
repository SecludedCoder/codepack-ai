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
  
  // 特殊文件名
  if (name === 'dockerfile') return '🐳';
  if (name === 'docker-compose.yml' || name === 'docker-compose.yaml') return '🐳';
  if (name === 'package.json') return '📦';
  if (name === 'tsconfig.json') return '📘';
  if (name === 'makefile' || name === 'gnumakefile') return '🔧';
  if (name === '.gitignore') return '🚫';
  if (name === '.env' || name.startsWith('.env.')) return '🔐';
  if (name === 'readme.md' || name === 'readme.txt' || name === 'readme') return '📖';
  if (name === 'license' || name === 'license.md' || name === 'license.txt') return '📜';
  
  // 根据扩展名
  const iconMap: Record<string, string> = {
    // 编程语言
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'py': '🐍',
    'java': '☕',
    'go': '🐹',
    'rs': '🦀',
    'php': '🐘',
    'rb': '💎',
    'swift': '🦉',
    'kt': '🗿',
    'scala': '🔴',
    'cpp': '🔷',
    'c': '🔷',
    'cs': '🟦',
    'lua': '🌙',
    'r': '📊',
    
    // Web 技术
    'html': '🌐',
    'htm': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'less': '🎨',
    'vue': '💚',
    'svelte': '🔥',
    
    // 数据格式
    'json': '📋',
    'xml': '📋',
    'yaml': '📋',
    'yml': '📋',
    'toml': '📋',
    'ini': '⚙️',
    'cfg': '⚙️',
    'conf': '⚙️',
    
    // 文档
    'md': '📝',
    'txt': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    
    // 图片
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🎨',
    'ico': '🖼️',
    
    // 其他
    'sh': '🐚',
    'bash': '🐚',
    'zsh': '🐚',
    'fish': '🐚',
    'ps1': '🐚',
    'sql': '🗄️',
    'db': '🗄️',
    'lock': '🔒',
    'log': '📋',
    'bak': '💾',
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'rar': '📦',
  };
  
  return iconMap[ext] || '📄';
}

// 检查是否应该忽略目录
export function shouldIgnoreDirectory(name: string): boolean {
  const ignoreDirs = [
    '.git',
    '.svn',
    '.hg',
    'node_modules',
    '__pycache__',
    '.venv',
    'venv',
    '.idea',
    '.vscode',
    'dist',
    'build',
    '.next',
    '.nuxt',
    'coverage',
    '.pytest_cache',
    '.mypy_cache',
    'vendor',
    'target',
    '.gradle',
    'bin',
    'obj',
    '.sass-cache',
    '.cache',
    'tmp',
    'temp',
  ];
  
  return ignoreDirs.includes(name.toLowerCase());
}