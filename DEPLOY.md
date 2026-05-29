# 部署说明

## 前置条件
- 已安装 Node.js 和 npm
- 已安装 wrangler CLI (你已经安装了

## 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 登录 Cloudflare
```bash
wrangler login
```

### 3. 创建 D1 数据库
```bash
wrangler d1 create tz-strategy-db
```

创建成功后，将输出的 database_id 复制到 wrangler.toml 的 database_id 字段。

### 4. 运行数据库迁移
```bash
wrangler d1 migrations apply tz-strategy-db --remote
```

### 5. 本地开发
```bash
npm run dev
```

### 6. 部署到 Cloudflare Pages
```bash
npm run deploy
```

## 本地开发
```bash
npm run dev
```
