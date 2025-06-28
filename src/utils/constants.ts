// 应用基本信息
export const APP_NAME = 'CodePack AI';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = '智能代码打包工具 - 轻松打包项目代码发送给 AI';

// 文件处理相关
export const DEFAULT_MAX_FILE_SIZE = 500 * 1024; // 500KB
export const MAX_BUNDLE_SIZE = 10 * 1024 * 1024; // 10MB
export const CHUNK_SIZE = 64 * 1024; // 64KB 用于分块读取大文件

// UI 相关
export const DEBOUNCE_DELAY = 300; // 搜索防抖延迟
export const TOAST_DURATION = 3000; // 提示消息显示时间

// 本地存储键名
export const STORAGE_KEYS = {
  FILTER_CONFIG: 'codepack-filter-config',
  RECENT_DIRS: 'codepack-recent-directories',
  USER_PREFERENCES: 'codepack-user-preferences',
  LAST_PRESET: 'codepack-last-preset',
} as const;

// 默认忽略的目录
export const DEFAULT_IGNORE_DIRS = [
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
] as const;

// 二进制文件扩展名（不尝试读取内容）
export const BINARY_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
  '.exe', '.dll', '.so', '.dylib',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  '.db', '.sqlite', '.sqlite3',
]);

// 特殊文件处理
export const SPECIAL_FILES = {
  'package.json': { icon: '📦', language: 'json' },
  'tsconfig.json': { icon: '📘', language: 'json' },
  'Dockerfile': { icon: '🐳', language: 'dockerfile' },
  'docker-compose.yml': { icon: '🐳', language: 'yaml' },
  'Makefile': { icon: '🔧', language: 'makefile' },
  '.gitignore': { icon: '🚫', language: 'gitignore' },
  '.env': { icon: '🔐', language: 'dotenv' },
  'README.md': { icon: '📖', language: 'markdown' },
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  BROWSER_NOT_SUPPORTED: '您的浏览器不支持目录选择功能。请使用 Chrome 86+, Edge 86+, 或 Opera 72+',
  NO_FILES_SELECTED: '请至少选择一个文件',
  FILE_READ_ERROR: '读取文件失败',
  BUNDLE_TOO_LARGE: '生成的打包文件过大，请减少选择的文件数量',
  INVALID_DIRECTORY: '无效的目录',
} as const;

// 快捷键
export const KEYBOARD_SHORTCUTS = {
  OPEN_DIRECTORY: { key: 'o', ctrlKey: true, description: '打开目录' },
  SELECT_ALL: { key: 'a', ctrlKey: true, description: '全选' },
  DESELECT_ALL: { key: 'd', ctrlKey: true, description: '取消全选' },
  SEARCH: { key: 'f', ctrlKey: true, description: '搜索文件' },
  GENERATE: { key: 'Enter', ctrlKey: true, description: '生成打包' },
} as const;