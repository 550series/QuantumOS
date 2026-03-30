# QuantumOS - MOSS AI操作系统

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-GPLv3-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript">
</p>

<p align="center">
  <strong>让人类永远保持理智</strong><br>
  模仿电影《流浪地球》中MOSS人工智能系统的浏览器操作系统
</p>

---

## ✨ 特性

### 🎨 赛博朋克美学设计
- **MOSS风格启动动画** - 14秒启动序列，包含代码雨、系统检测、3D MOSS眼睛
- **霓虹色彩主题** - 极光青(#00F0FF)、深空蓝背景、发光效果
- **玻璃态UI** - 毛玻璃效果、扫描线、故障动画
- **CRT显示效果** - 复古CRT扫描线叠加

### 🖥️ 完整的操作系统功能
- **文件管理系统** - 虚拟文件系统、文件CRUD、预览、搜索
- **任务调度系统** - 任务队列、资源监控、实时状态更新
- **AI智能决策** - MOSS决策引擎、推理可视化、人格模拟
- **系统日志与警报** - 实时日志流、警报弹窗、分级过滤

### 🤖 MOSS AI核心
- **决策引擎** - 基于规则的智能决策系统
- **人格模拟** - "让人类永远保持理智"的冷静理性交互
- **实时分析** - 系统状态监测、风险评估、资源优化建议

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/550series/QuantumOS.git

# 进入目录
cd QuantumOS

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 体验MOSS操作系统

### 构建生产版本

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

---

## 📦 技术栈

### 前端技术
- **框架**: Next.js 14 (App Router)
- **UI库**: React 18
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3 + 自定义赛博朋克主题
- **状态管理**: Zustand 4 + Immer
- **动画**: Framer Motion 11
- **3D渲染**: Three.js + @react-three/fiber + @react-three/drei
- **图表**: Recharts 2
- **数据持久化**: IndexedDB (idb库)

### 开发工具
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript strict mode
- **Git Hooks**: Husky

---

## 📁 项目结构

```
QuantumOS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 启动动画页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── globals.css        # 全局样式
│   │   └── desktop/           # 桌面主界面
│   │
│   ├── components/             # React组件
│   │   ├── boot/              # 启动动画（CodeRain、MossEye等）
│   │   ├── desktop/           # 桌面系统（WindowManager、Taskbar等）
│   │   ├── file-manager/      # 文件管理器
│   │   ├── task-scheduler/    # 任务调度器
│   │   ├── ai-system/         # AI决策中心
│   │   ├── system/            # 日志与警报系统
│   │   └── ui/                # 基础UI组件
│   │
│   ├── stores/                 # Zustand状态管理
│   │   ├── systemStore.ts     # 系统全局状态
│   │   ├── fileStore.ts       # 文件系统状态
│   │   ├── taskStore.ts       # 任务调度状态
│   │   └── aiStore.ts         # AI决策状态
│   │
│   ├── services/               # 服务层
│   │   ├── fileService.ts     # 文件系统服务
│   │   ├── taskService.ts     # 任务调度服务
│   │   └── logService.ts      # 日志与警报服务
│   │
│   ├── lib/                    # 工具库
│   │   ├── db/                # IndexedDB封装
│   │   └── ai/                # AI决策引擎
│   │
│   └── types/                  # TypeScript类型定义
│
├── public/                     # 静态资源
├── package.json
├── tailwind.config.ts         # Tailwind配置（赛博朋克主题）
└── tsconfig.json              # TypeScript配置
```

---

## 🎯 核心功能模块

### 1. MOSS启动动画系统
- **黑屏阶段** (0-1s) - 中心光点渐显
- **代码雨阶段** (1-4s) - MOSS风格代码流
- **系统检测阶段** (4-8s) - 硬件检测动画
- **MOSS核心初始化** (8-12s) - Three.js 3D MOSS眼睛
- **桌面加载** (12-14s) - 过渡到桌面

### 2. 文件管理系统
- 虚拟文件系统 (VFS) 模拟
- 文件/文件夹 CRUD 操作（IndexedDB存储）
- 文件预览（文本、图片、代码）
- 拖拽交互、搜索过滤
- 网格/列表视图切换

### 3. 任务调度系统
- 任务创建、配置、执行
- 任务队列管理
- 实时状态监控（WebSocket推送）
- 资源占用可视化
- 任务依赖关系图

### 4. AI智能决策系统（MOSS核心）
- **决策引擎** - 基于规则的智能决策模拟
- **预测分析** - 趋势预测与建议生成
- **异常检测** - 系统异常自动识别
- **MOSS人格** - 冷静理性的交互体验

### 5. 系统日志与警报
- 实时日志流显示
- 多级别日志过滤（INFO/WARNING/ERROR/CRITICAL）
- 警报弹窗通知
- 日志搜索与导出

---

## 🎨 UI/UX 设计

### 配色方案

| 类型 | 名称 | 色值 | 用途 |
|------|------|------|------|
| 主色 | 深空蓝 | #0A0E17 | 背景主色 |
| 主色 | 极光青 | #00F0FF | 核心强调色 |
| 主色 | 星光白 | #E8F4F8 | 文字/边框 |
| 功能色 | 能量橙 | #FF6B35 | 警告/重要操作 |
| 功能色 | 等离子红 | #FF2E63 | 错误/紧急警报 |
| 功能色 | 量子绿 | #00FF88 | 成功/正常状态 |
| 功能色 | 深空紫 | #7B2CBF | 信息提示 |

### 视觉效果
- **霓虹发光**: `box-shadow: 0 0 20px rgba(0, 240, 255, 0.5)`
- **扫描线**: CSS伪元素创建CRT显示器效果
- **玻璃态**: `backdrop-filter: blur(10px)`
- **故障效果**: Glitch动画用于关键数据变化

---

## 🔌 API设计

### RESTful API
```
GET    /api/files              # 获取文件列表
POST   /api/files              # 创建文件/文件夹
PUT    /api/files/:id          # 更新文件
DELETE /api/files/:id          # 删除文件

GET    /api/tasks              # 获取任务列表
POST   /api/tasks              # 创建任务
POST   /api/tasks/:id/start    # 启动任务
POST   /api/tasks/:id/cancel   # 取消任务

GET    /api/ai/decisions       # 获取决策历史
POST   /api/ai/analyze         # 触发分析
POST   /api/ai/decisions/:id/approve  # 批准决策
```

### WebSocket事件
```
task:created    - 任务创建
task:updated    - 任务更新
ai:decision     - 新决策生成
system:alert    - 系统警报
```

---

## 🧪 测试

```bash
# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint
```

---

## 📝 开发说明

### 代码规范
- 使用TypeScript strict mode
- 遵循ESLint规则
- 组件采用函数式组件 + Hooks
- 状态管理使用Zustand + Immer

### 提交规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/)

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 📄 许可证

本项目采用 GNU General Public License v3.0 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 灵感来源：电影《流浪地球》中的MOSS人工智能系统
- 设计风格：赛博朋克美学 (Cyberpunk Aesthetic)
- 技术框架：Next.js、React、Three.js

---

## 📮 联系方式

- 项目地址: [https://github.com/550series/QuantumOS](https://github.com/550series/QuantumOS)
- 问题反馈: [GitHub Issues](https://github.com/550series/QuantumOS/issues)

---

<p align="center">
  <strong>MOSS: "让人类永远保持理智，是我的职责。"</strong>
</p>
