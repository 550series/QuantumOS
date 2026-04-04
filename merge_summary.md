此次合并主要移除了文件管理器相关功能，包括删除了FileManager组件、相关服务和类型定义，并在主页面中移除了对文件管理器的引用。这些变更简化了应用结构，移除了未使用的文件管理功能。
| 文件 | 变更 |
|------|---------|
| src/app/desktop/page.tsx | - 移除了FileManager组件的导入<br>- 从AppType类型中删除了'file-manager'选项<br>- 从appConfig对象中移除了文件管理器配置 |
| src/components/file-manager/FileManager.tsx | - 完全删除了FileManager组件文件 |
| src/components/file-manager/index.ts | - 完全删除了文件管理器的索引文件 |
| src/services/fileService.ts | - 完全删除了文件服务相关代码 |
| src/stores/fileStore.ts | - 完全删除了文件存储相关代码 |
| src/stores/index.ts | - 移除了对fileStore的引用 |
| src/types/file.ts | - 完全删除了文件相关类型定义 |
| src/types/index.ts | - 完全删除了类型索引文件 |