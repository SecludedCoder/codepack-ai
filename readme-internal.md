# CodePack AI - 内部开发文档

⚠️ **内部文档，不要公开**

## 项目概述

CodePack AI 是一个智能代码打包工具，专门为与 LLM 对话而设计。本文档包含内部开发细节、部署密钥和维护指南。

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript 4.5+
- **构建工具**: Vite 5
- **样式方案**: CSS Modules
- **状态管理**: React Hooks (useState, useContext)
- **文件系统**: File System Access API
- **PWA**: Vite PWA Plugin

### 核心功能模块

1. **文件系统处理** (`useFileSystem`)
   - 使用 File System Access API
   - 降级方案：拖拽上传
   - 文件内容缓存使用 useRef 避免重渲染

2. **过滤系统** (`useFileFilters`)
   - 预设模板系统
   - 自定义规则引擎
   - 性能优化：使用 Set 数据结构

3. **打包生成** (`bundleGenerator`)
   - 流式处理大文件
   - 智能语言检测
   - 内存优化：分块生成

## 部署配置

### Vercel 部署

```bash
# 环境变量（Vercel Dashboard）
NODE_ENV=production
VITE_APP_TITLE=CodePack AI
VITE_DEPLOY_URL=https://codepack.ai
```

### GitHub Actions 密钥

```yaml
# 需要在 GitHub Settings > Secrets 中配置
GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
VERCEL_TOKEN: xxx-xxx-xxx
VERCEL_ORG_ID: team_xxx
VERCEL_PROJECT_ID: prj_xxx
```

## 开发规范

### Git 分支策略
- `main`: 生产环境
- `develop`: 开发环境
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复

### 提交规范
```bash
# 格式: <type>(<scope>): <subject>
feat(filter): 添加正则表达式支持
fix(explorer): 修复文件树展开问题
docs(readme): 更新使用说明
```

### 代码规范
1. 使用 ESLint + Prettier
2. 组件使用函数式 + Hooks
3. 严格的 TypeScript 类型
4. CSS Modules 命名规范

## 性能优化

### 1. 大文件处理
```typescript
// 使用 Web Workers 处理大文件
const worker = new Worker('/file-processor.js');
worker.postMessage({ file, chunkSize: 64 * 1024 });
```

### 2. 虚拟滚动
```typescript
// 文件列表超过 1000 项时启用
import { VirtualList } from '@tanstack/react-virtual';
```

### 3. 懒加载
```typescript
// 路由级别代码分割
const FilterPanel = lazy(() => import('./components/FilterPanel'));
```

## 监控和分析

### 错误追踪
```javascript
// Sentry 配置
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 性能监控
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送到分析服务
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 安全考虑

1. **CSP 策略**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

2. **敏感信息**
   - 所有处理都在客户端完成
   - 不收集用户文件内容
   - 不使用第三方存储

3. **依赖安全**
   ```bash
   # 定期检查
   npm audit
   npm audit fix
   ```

## 维护清单

### 每周
- [ ] 检查依赖更新
- [ ] 审查错误日志
- [ ] 性能指标分析

### 每月
- [ ] 更新依赖包
- [ ] 安全审计
- [ ] 用户反馈整理

### 每季度
- [ ] 重大版本更新评估
- [ ] 性能优化回顾
- [ ] 代码重构计划

## 已知问题

1. **Firefox 兼容性**
   - File System Access API 不支持
   - 降级到拖拽上传

2. **Safari 限制**
   - PWA 功能受限
   - 本地存储有容量限制

3. **性能瓶颈**
   - 大型项目（10000+ 文件）加载慢
   - 解决方案：实现虚拟文件树

## 未来规划

### v1.1.0
- [ ] 暗色主题支持
- [ ] 导入/导出配置
- [ ] 批量操作优化

### v1.2.0
- [ ] 云端同步（可选）
- [ ] 插件系统
- [ ] 多语言支持

### v2.0.0
- [ ] Electron 桌面版
- [ ] VS Code 扩展
- [ ] API 服务

## 联系方式

- 项目负责人：[姓名] <email@example.com>
- 技术支持：tech-support@codepack.ai
- 紧急联系：+86 xxx-xxxx-xxxx

## 许可证

内部使用，未经授权禁止公开。

---

最后更新：2024-01-20