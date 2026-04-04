# QuantumOS - MOSS AI操作系统 Code Wiki

## 1. 项目概述

QuantumOS是一个模仿电影《流浪地球》中MOSS人工智能系统的浏览器操作系统，采用赛博朋克美学设计风格。

### 1.1 核心特性
- **赛博朋克美学设计** - MOSS风格启动动画、霓虹色彩主题、玻璃态UI、CRT显示效果
- **完整的操作系统功能** - 文件管理系统、任务调度系统、AI智能决策、系统日志与警报
- **MOSS AI核心** - 决策引擎、人格模拟、实时分析

### 1.2 技术栈
- **前端技术**: Next.js 14 (App Router)、React 18、TypeScript 5、Tailwind CSS 3
- **状态管理**: Zustand 4 + Immer
- **动画**: Framer Motion 11
- **3D渲染**: Three.js + @react-three/fiber + @react-three/drei
- **数据持久化**: IndexedDB (idb库)

## 2. 目录结构

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

## 3. 系统架构

### 3.1 整体架构

QuantumOS采用现代前端架构，基于Next.js 14的App Router模式，结合Zustand状态管理，实现了一个模拟操作系统的浏览器应用。系统分为以下几个核心层次：

1. **表现层** - React组件，负责UI渲染
2. **状态管理层** - Zustand stores，管理应用状态
3. **服务层** - 处理业务逻辑和数据操作
4. **数据层** - IndexedDB存储，模拟持久化存储

### 3.2 核心流程

1. **启动流程**：用户访问应用 → 显示MOSS风格启动动画 → 初始化系统状态 → 进入桌面界面
2. **文件管理流程**：用户操作文件 → 调用fileService → 更新IndexedDB → 状态管理更新 → UI更新
3. **AI决策流程**：系统状态变化 → AI引擎分析 → 生成决策 → 用户确认 → 执行决策

## 4. 核心模块

### 4.1 MOSS启动动画系统

**功能**：模拟MOSS操作系统的启动过程，包含多个阶段的动画效果。

**实现**：
- **BootSequence.tsx**：主启动序列组件，控制启动流程和状态
- **CodeRain.tsx**：代码雨效果，模拟矩阵风格的代码流
- **MossEye.tsx**：3D MOSS眼睛组件，使用Three.js渲染
- **SystemStatus.tsx**：系统状态显示组件

**启动阶段**：
1. **黑屏阶段** (0-1s) - 中心光点渐显
2. **代码雨阶段** (1-4s) - MOSS风格代码流
3. **系统检测阶段** (4-8s) - 硬件检测动画
4. **MOSS核心初始化** (8-12s) - Three.js 3D MOSS眼睛
5. **桌面加载** (12-14s) - 过渡到桌面

### 4.2 文件管理系统

**功能**：提供虚拟文件系统，支持文件和文件夹的CRUD操作。

**实现**：
- **FileManager.tsx**：文件管理器主组件
- **fileService.ts**：文件系统服务，处理文件操作
- **fileStore.ts**：文件系统状态管理

**特性**：
- 虚拟文件系统 (VFS) 模拟
- 文件/文件夹 CRUD 操作（IndexedDB存储）
- 文件预览（文本、图片、代码）
- 拖拽交互、搜索过滤
- 网格/列表视图切换

### 4.3 任务调度系统

**功能**：管理系统任务，包括创建、执行、监控等。

**实现**：
- **TaskScheduler.tsx**：任务调度器主组件
- **taskService.ts**：任务调度服务
- **taskStore.ts**：任务状态管理

**特性**：
- 任务创建、配置、执行
- 任务队列管理
- 实时状态监控（WebSocket推送）
- 资源占用可视化
- 任务依赖关系图

### 4.4 AI智能决策系统（MOSS核心）

**功能**：模拟MOSS人工智能的决策过程，提供智能分析和建议。

**实现**：
- **AIDecisionCenter.tsx**：AI决策中心主组件
- **decisionEngine.ts**：AI决策引擎核心逻辑
- **aiStore.ts**：AI状态管理

**特性**：
- **决策引擎** - 基于规则的智能决策模拟
- **预测分析** - 趋势预测与建议生成
- **异常检测** - 系统异常自动识别
- **MOSS人格** - 冷静理性的交互体验

### 4.5 系统日志与警报

**功能**：记录系统事件，提供警报通知。

**实现**：
- **SystemMonitor.tsx**：系统监控组件
- **logService.ts**：日志与警报服务
- **systemStore.ts**：系统状态管理

**特性**：
- 实时日志流显示
- 多级别日志过滤（INFO/WARNING/ERROR/CRITICAL）
- 警报弹窗通知
- 日志搜索与导出

## 5. 关键组件

### 5.1 BootSequence 组件

**位置**：[src/components/boot/BootSequence.tsx](file:///workspace/src/components/boot/BootSequence.tsx)

**功能**：控制整个启动流程，包括各个阶段的动画和状态转换。

**核心逻辑**：
- 使用 `useEffect` 管理启动时间线
- 使用 `motion` 组件实现平滑动画
- 控制启动进度和状态转换
- 最终导航到桌面页面

### 5.2 AIDecisionCenter 组件

**位置**：[src/components/ai-system/AIDecisionCenter.tsx](file:///workspace/src/components/ai-system/AIDecisionCenter.tsx)

**功能**：展示MOSS AI决策系统的界面，处理决策的生成、批准和拒绝。

**核心逻辑**：
- 初始化AI决策系统和默认决策
- 处理决策的批准和拒绝
- 触发新的决策分析
- 展示MOSS消息和决策历史

### 5.3 FileManager 组件

**位置**：[src/components/file-manager/FileManager.tsx](file:///workspace/src/components/file-manager/FileManager.tsx)

**功能**：提供文件管理界面，支持文件和文件夹的操作。

**核心逻辑**：
- 初始化文件系统
- 加载当前目录文件
- 处理文件双击、右键菜单等交互
- 支持创建、删除文件和文件夹
- 提供网格和列表两种视图模式

### 5.4 RootLayout 组件

**位置**：[src/app/layout.tsx](file:///workspace/src/app/layout.tsx)

**功能**：定义应用的根布局，设置全局样式和字体。

**核心逻辑**：
- 设置页面标题和描述
- 引入Google字体（JetBrains Mono和Orbitron）
- 应用CRT显示效果

## 6. 状态管理

QuantumOS使用Zustand进行状态管理，主要包含以下stores：

- **systemStore**：管理系统全局状态，如系统状态、警报等
- **fileStore**：管理文件系统状态，如当前路径、选中文件等
- **taskStore**：管理任务调度状态，如任务列表、执行状态等
- **aiStore**：管理AI决策状态，如决策列表、消息等

## 7. 数据持久化

系统使用IndexedDB（通过idb库）进行数据持久化，主要存储：

- **文件系统数据**：文件和文件夹的结构和内容
- **任务数据**：任务配置和执行状态
- **决策数据**：AI决策历史和状态
- **系统设置**：用户偏好和系统配置

## 8. API设计

### 8.1 RESTful API

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

### 8.2 WebSocket事件

```
task:created    - 任务创建
task:updated    - 任务更新
ai:decision     - 新决策生成
system:alert    - 系统警报
```

## 9. 运行方式

### 9.1 环境要求
- Node.js 18+
- npm 或 pnpm

### 9.2 安装与运行

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

### 9.3 构建生产版本

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

## 10. 开发规范

### 10.1 代码规范
- 使用TypeScript strict mode
- 遵循ESLint规则
- 组件采用函数式组件 + Hooks
- 状态管理使用Zustand + Immer

### 10.2 提交规范
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

## 11. 技术亮点

1. **赛博朋克美学设计**：独特的视觉风格，包括霓虹色彩、玻璃态UI、CRT扫描线效果
2. **3D MOSS眼睛**：使用Three.js实现的3D MOSS眼睛，增强视觉冲击力
3. **模拟操作系统**：完整的文件系统、任务调度、AI决策等操作系统功能
4. **智能决策系统**：基于规则的AI决策引擎，模拟MOSS的决策过程
5. **IndexedDB持久化**：使用IndexedDB实现数据持久化，模拟真实操作系统的存储

## 12. 未来发展方向

1. **增强AI能力**：集成真实的AI模型，提供更智能的决策和交互
2. **多用户支持**：添加用户认证和多用户环境
3. **应用生态**：开发更多应用程序，丰富系统功能
4. **响应式设计**：优化不同设备的显示效果
5. **性能优化**：提升系统响应速度和稳定性

## 13. 许可证

本项目采用 GNU General Public License v3.0 许可证 - 详见 [LICENSE](file:///workspace/LICENSE) 文件

## 14. 联系方式

- 项目地址: [https://github.com/550series/QuantumOS](https://github.com/550series/QuantumOS)
- 问题反馈: [GitHub Issues](https://github.com/550series/QuantumOS/issues)

---

<p align="center">
  <strong>MOSS: "让人类永远保持理智，是我的职责。"</strong>
</p>