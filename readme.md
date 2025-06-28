# CodePack AI - 智能代码打包工具

轻松打包项目代码，一键发送给 AI！

## 特性

- 🚀 **直接选择本地目录** - 无需压缩，直接选择项目文件夹
- 🎯 **智能文件过滤** - 预设多种项目类型模板，自动过滤无关文件
- 📏 **文件大小控制** - 自定义最大文件大小限制
- 🔍 **实时搜索** - 快速查找和选择需要的文件
- 📦 **一键打包** - 生成格式化的文本文件，适合粘贴给 AI
- 🔒 **隐私安全** - 纯前端处理，文件不会上传到任何服务器
- 📱 **PWA 支持** - 可安装为桌面应用，支持离线使用

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+ 或 yarn 1.22+
- 浏览器：Chrome 86+, Edge 86+, Opera 72+（完整功能支持）

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/codepack-ai.git
cd codepack-ai

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 使用方法

1. **选择项目目录**
   - 点击"选择目录"按钮或拖拽文件夹到指定区域
   - 浏览器会请求文件系统访问权限

2. **配置过滤规则**
   - 选择项目类型预设（Python、JavaScript、Java 等）
   - 或自定义文件扩展名和大小限制

3. **选择文件**
   - 在文件树中勾选需要打包的文件
   - 使用搜索功能快速定位文件
   - 使用"全选"/"取消全选"批量操作

4. **生成打包文件**
   - 点击"生成打包文件"按钮
   - 自动下载格式化的文本文件
   - 或复制内容直接粘贴给 AI

## 部署

### 选项 1: Vercel（推荐）

1. Fork 或导入此仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动构建和部署

### 选项 2: GitHub Pages

```bash
# 部署到 GitHub Pages
npm run deploy
```

### 选项 3: 自托管

```bash
# 构建静态文件
npm run build

# dist 目录包含所有静态文件
# 可以部署到任何静态文件服务器
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: CSS Modules
- **PWA**: Vite PWA Plugin
- **文件系统**: File System Access API

## 浏览器兼容性

| 功能 | Chrome | Edge | Firefox | Safari |
|------|--------|------|---------|--------|
| 目录选择 | ✅ 86+ | ✅ 86+ | ❌ | ❌ |
| 拖拽上传 | ✅ | ✅ | ✅ | ✅ |
| 文件读取 | ✅ | ✅ | ✅ | ✅ |
| PWA | ✅ | ✅ | ✅ | ⚠️ |

## 项目结构

```
codepack-ai/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript 类型
│   ├── styles/         # 全局样式
│   └── App.tsx         # 主应用
├── package.json
└── vite.config.ts
```

## 开发指南

### 添加新的项目预设

在 `src/utils/presets.ts` 中添加新的预设配置：

```typescript
export const PRESETS = {
  // ... 现有预设
  myNewPreset: {
    name: '我的预设',
    description: '预设描述',
    includeExtensions: ['.ext1', '.ext2'],
    excludePatterns: ['pattern1', 'pattern2'],
    maxFileSize: 500 * 1024,
  }
};
```

### 自定义样式

全局样式在 `src/styles/globals.css`，组件样式使用 CSS Modules。

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！