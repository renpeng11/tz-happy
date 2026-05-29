# 台州旅游推荐项目

一个基于 React + TypeScript + Vite 构建的台州旅游景点推荐和投票应用。

## ✨ 功能特点

- **景点展示**：展示台州十大热门旅游景点，包含详细介绍和精美图片
- **路线规划**：提供多条精选旅游路线供用户参考
- **天气查询**：实时获取台州天气信息，方便出行规划
- **投票功能**：用户可以为喜欢的景点投票，支持结果展示
- **响应式设计**：适配桌面端和移动端设备

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS 3
- **图标库**: Lucide React
- **图表库**: Chart.js + react-chartjs-2
- **部署平台**: Cloudflare Pages
- **数据库**: Cloudflare D1

## 📦 安装与运行

### 前置要求

- Node.js >= 18.x
- pnpm >= 8.x

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 查看应用

### 生产构建

```bash
pnpm build
```

构建产物将输出到 `dist` 目录

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
├── functions/          # Cloudflare Functions
│   └── api/            # API 路由
├── migrations/         # 数据库迁移脚本
├── public/             # 静态资源
│   └── imgs/           # 景点图片
├── src/
│   ├── components/     # React 组件
│   ├── context/        # React Context
│   ├── data/           # 数据文件
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── wrangler.toml       # Cloudflare 配置
```

## 🌐 部署

### Cloudflare Pages 部署

```bash
pnpm deploy
```

### 数据库配置

```bash
# 创建 D1 数据库
pnpm db:create

# 应用数据库迁移
pnpm db:migrate
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！