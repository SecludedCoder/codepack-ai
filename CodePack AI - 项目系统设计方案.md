# CodePack AI - 项目系统设计方案

> 版本：1.0.0  
> 更新日期：2025-06-28  
> 项目状态：95% 完成，待部署

## 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [功能模块设计](#功能模块设计)
4. [核心组件说明](#核心组件说明)
5. [数据流设计](#数据流设计)
6. [文件结构](#文件结构)
7. [部署架构](#部署架构)
8. [性能优化方案](#性能优化方案)
9. [安全设计](#安全设计)
10. [未来扩展计划](#未来扩展计划)

## 项目概述

### 项目定位
CodePack AI 是一个智能代码打包工具，专门为开发者与 AI 对话场景设计。它通过纯前端技术实现，让用户能够轻松选择本地项目目录，智能过滤文件，并生成适合粘贴给 AI 的格式化文本文件。

### 核心价值
- **零服务器依赖**：所有处理在浏览器端完成，保护用户隐私
- **智能过滤**：预设多种项目类型模板，自动识别和过滤无关文件
- **即时处理**：无需上传下载，直接在本地完成所有操作
- **跨平台支持**：支持 PWA，可作为桌面应用使用

### 目标用户
- 需要向 AI 提供代码上下文的开发者
- 进行代码审查或技术讨论的团队
- 学习编程并需要 AI 辅助的学生

## 技术架构

### 前端技术栈
```
┌─────────────────────────────────────────────────┐
│                   用户界面层                      │
│         React 18 + TypeScript + CSS Modules      │
├─────────────────────────────────────────────────┤
│                   状态管理层                      │
│          React Hooks + Context (未来考虑)         │
├─────────────────────────────────────────────────┤
│                   业务逻辑层                      │
│     Custom Hooks + Utils + Bundle Generator      │
├─────────────────────────────────────────────────┤
│                   数据持久层                      │
│            LocalStorage + File System API        │
├─────────────────────────────────────────────────┤
│                   构建工具层                      │
│              Vite 5 + PWA Plugin                │
└─────────────────────────────────────────────────┘
```

### 核心技术选型理由
- **React 18**：成熟的组件化方案，良好的生态系统
- **TypeScript**：提供类型安全，减少运行时错误
- **Vite 5**：极快的开发体验，优秀的构建性能
- **CSS Modules**：组件级样式隔离，避免样式冲突
- **File System Access API**：现代浏览器原生支持，提供完整的文件系统访问能力

## 功能模块设计

### 1. 文件系统模块
**核心功能**：
- 使用 File System Access API 读取本地目录
- 降级方案：支持拖拽上传文件夹
- 递归构建文件树结构
- 实时文件内容缓存

**关键实现**：
```typescript
// hooks/useFileSystem.ts
- loadDirectory(): 打开目录选择器
- handleDrop(): 处理拖拽上传
- getFileContent(): 异步读取文件内容
- 自动过滤常见的无关目录（node_modules, .git 等）
```

### 2. 过滤系统模块
**核心功能**：
- 预设项目类型模板（Python、JavaScript、TypeScript 等）
- 文件大小限制（默认 500KB，可调整）
- 自定义扩展名过滤
- 排除模式支持（正则表达式）

**预设模板**：
- Python 项目：.py, .pyx, requirements.txt 等
- JavaScript 项目：.js, .jsx, package.json 等
- TypeScript 项目：.ts, .tsx, tsconfig.json 等
- Java 项目：.java, .xml, pom.xml 等
- Go 项目：.go, .mod, Makefile 等
- Web 前端项目：.html, .css, .js, .vue 等

### 3. 用户界面模块
**组件结构**：
```
App.tsx                    # 主应用组件
├── Header                 # 顶部导航栏
├── FileExplorer          # 文件浏览器
│   ├── FileTree          # 文件树渲染
│   └── FileNode          # 单个文件/目录节点
├── FilterPanel           # 过滤设置面板
│   ├── PresetFilters     # 预设过滤器
│   └── SizeFilter        # 文件大小过滤
├── ActionPanel           # 操作面板
│   └── QuickActions      # 快速操作按钮
├── OutputPreview         # 输出预览弹窗
└── Footer               # 页面底部
```

### 4. 打包生成模块
**核心功能**：
- 智能语言检测（根据文件扩展名）
- 代码高亮标记（Markdown 格式）
- 文件树结构可视化
- 进度反馈和错误处理

**输出格式**：
```markdown
================================================================================
# 项目代码打包 - CodePack AI
# 生成时间: 2025-06-28T13:48:58.000Z
# 文件数量: 25
# 总大小: 125.3 KB
# 项目根目录: my-project
================================================================================

## 📁 包含的文件结构：

```
my-project/
├── src/
│   ├── index.js ✓
│   └── utils.js ✓
└── package.json ✓
```

## 📄 文件内容：

### 文件: src/index.js

```javascript
// 文件内容...
```
```

## 核心组件说明

### FileExplorer 组件
- **功能**：展示文件树，支持展开/折叠、搜索、选择
- **状态管理**：
  - `expandedDirs`: Set<string> - 展开的目录
  - `searchTerm`: string - 搜索关键词
  - `selectedFiles`: Set<string> - 选中的文件（由父组件管理）

### FilterPanel 组件
- **功能**：配置过滤规则，选择预设模板
- **状态管理**：
  - `config`: FilterConfig - 当前过滤配置
  - 支持实时更新和持久化到 LocalStorage

### useFileSystem Hook
- **功能**：封装文件系统操作逻辑
- **关键方法**：
  - 浏览器兼容性检查
  - 文件内容缓存（使用 useRef 避免重渲染）
  - 错误处理和状态管理

### useFileFilters Hook
- **功能**：文件过滤逻辑处理
- **特性**：
  - 支持多维度过滤（大小、扩展名、路径模式）
  - 过滤配置持久化
  - 文件统计信息生成

## 数据流设计

```
用户操作
   ↓
[选择目录/拖拽] → useFileSystem → 文件树数据
                                      ↓
[配置过滤器] → useFileFilters → 过滤后的文件树
                                      ↓
[选择文件] → App组件状态 → selectedFiles Set
                              ↓
[生成打包] → bundleGenerator → 格式化文本
                                    ↓
                              [下载/复制]
```

## 文件结构

```
codepack-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署
├── public/
│   ├── index.html             # HTML 入口
│   ├── manifest.json          # PWA 配置
│   └── [图标文件]             # 各种尺寸的图标
├── src/
│   ├── components/            # React 组件
│   │   ├── FileExplorer/      # 文件浏览器
│   │   ├── FilterPanel/       # 过滤面板
│   │   ├── ActionPanel/       # 操作面板
│   │   ├── OutputPreview/     # 输出预览
│   │   └── Layout/            # 布局组件
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useFileSystem.ts   # 文件系统操作
│   │   ├── useLocalStorage.ts # 本地存储
│   │   └── useFileFilters.ts  # 文件过滤逻辑
│   ├── utils/                 # 工具函数
│   │   ├── bundleGenerator.ts # 打包生成
│   │   ├── constants.ts       # 常量定义
│   │   └── presets.ts         # 预设配置
│   ├── types/                 # TypeScript 类型
│   ├── styles/                # 全局样式
│   ├── App.tsx                # 主应用组件
│   └── index.tsx              # 入口文件
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 部署架构

### 部署选项
1. **GitHub Pages**（已配置）
   - 通过 GitHub Actions 自动构建部署
   - 适合开源项目

2. **Vercel**（推荐）
   - 零配置部署
   - 自动 HTTPS 和 CDN
   - 支持私有仓库

3. **自托管**
   - 构建静态文件
   - 部署到任意 Web 服务器
   - 支持 Docker 容器化

### CI/CD 流程
```yaml
# .github/workflows/deploy.yml
1. 代码推送到 main 分支
2. 触发 GitHub Actions
3. 安装依赖
4. 运行类型检查和 lint
5. 构建生产版本
6. 部署到 GitHub Pages
```

## 性能优化方案

### 当前实现
1. **文件内容缓存**
   - 使用 useRef 存储文件内容
   - 避免重复读取

2. **组件优化**
   - 使用 React.memo 优化渲染
   - 合理的组件拆分

3. **懒加载准备**
   - 模块化的组件结构
   - 便于未来实现路由级懒加载

### 未来优化
1. **虚拟滚动**
   - 处理大型文件树（10000+ 文件）
   - 使用 react-window 或 @tanstack/react-virtual

2. **Web Workers**
   - 大文件处理移至后台线程
   - 避免阻塞 UI

3. **分块处理**
   - 大文件分块读取
   - 流式生成输出

## 安全设计

### 隐私保护
- **纯前端处理**：所有操作在用户浏览器完成
- **无服务器通信**：不上传任何文件或数据
- **本地存储**：配置仅保存在 LocalStorage

### 内容安全
- **文件大小限制**：防止内存溢出
- **二进制文件识别**：自动跳过不可读文件
- **错误边界**：优雅处理异常情况

### CSP 策略（建议）
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

## 未来扩展计划

### v1.1.0 功能增强
- [ ] 暗色主题支持
- [ ] 配置导入/导出
- [ ] 批量操作优化
- [ ] 多语言支持（i18n）

### v1.2.0 高级功能
- [ ] 文件内容预览
- [ ] 智能内容摘要
- [ ] 自定义输出模板
- [ ] 插件系统架构

### v2.0.0 生态扩展
- [ ] VS Code 扩展
- [ ] JetBrains 插件
- [ ] Electron 桌面版
- [ ] CLI 工具

## 项目特色

1. **零配置使用**：开箱即用，无需复杂设置
2. **隐私优先**：所有处理本地完成，数据不离开设备
3. **现代化技术**：使用最新的 Web API 和前端技术
4. **优秀的用户体验**：直观的界面，流畅的交互
5. **可扩展性**：模块化设计，便于功能扩展