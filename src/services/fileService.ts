import { v4 as uuidv4 } from 'uuid';
import { fileDB } from '@/lib/db';
import type { FileNode, FileFilter, FileSort } from '@/types';

// 创建默认文件夹结构
export async function initDefaultFileSystem(): Promise<void> {
  const existingFiles = await fileDB.getAll();
  if (existingFiles.length > 0) return;

  const rootFolders = [
    { name: 'Documents', type: 'folder' as const, mimeType: 'inode/directory' },
    { name: 'Pictures', type: 'folder' as const, mimeType: 'inode/directory' },
    { name: 'Videos', type: 'folder' as const, mimeType: 'inode/directory' },
    { name: 'Music', type: 'folder' as const, mimeType: 'inode/directory' },
    { name: 'Downloads', type: 'folder' as const, mimeType: 'inode/directory' },
    { name: 'System', type: 'folder' as const, mimeType: 'inode/directory' },
  ];

  const now = new Date();
  const defaultPermission = {
    read: true,
    write: true,
    execute: false,
    owner: 'moss',
    group: 'users',
  };

  for (const folder of rootFolders) {
    const fileNode: FileNode = {
      id: uuidv4(),
      name: folder.name,
      type: folder.type,
      parentId: null,
      content: null,
      mimeType: folder.mimeType,
      size: 0,
      createdAt: now,
      modifiedAt: now,
      permissions: defaultPermission,
      metadata: {},
    };
    await fileDB.add(fileNode);
  }

  // 创建示例文件
  const readmeFile: FileNode = {
    id: uuidv4(),
    name: 'README.md',
    type: 'file',
    parentId: null,
    content: `# QuantumOS - MOSS人工智能操作系统

## 欢迎使用MOSS系统

MOSS（Moss Operating System Shell）是一个基于量子计算的人工智能操作系统。

### 特性
- 量子计算核心
- AI智能决策引擎
- 实时系统监控
- 赛博朋克用户界面

### 注意事项
让人类永远保持理智。
`,
    mimeType: 'text/markdown',
    size: 0,
    createdAt: now,
    modifiedAt: now,
    permissions: defaultPermission,
    metadata: {},
  };
  await fileDB.add(readmeFile);
}

// 获取文件列表
export async function getFiles(parentId: string | null = null): Promise<FileNode[]> {
  const allFiles = await fileDB.getAll();
  return allFiles.filter((file) => file.parentId === parentId);
}

// 获取单个文件
export async function getFile(id: string): Promise<FileNode | undefined> {
  return await fileDB.getById(id);
}

// 创建文件
export async function createFile(
  file: Omit<FileNode, 'id' | 'createdAt' | 'modifiedAt'>
): Promise<FileNode> {
  const now = new Date();
  const newFile: FileNode = {
    ...file,
    id: uuidv4(),
    createdAt: now,
    modifiedAt: now,
    size: file.content ? new Blob([file.content]).size : 0,
  };
  await fileDB.add(newFile);
  return newFile;
}

// 更新文件
export async function updateFile(
  id: string,
  updates: Partial<FileNode>
): Promise<FileNode | undefined> {
  const file = await fileDB.getById(id);
  if (!file) return undefined;

  const updatedFile: FileNode = {
    ...file,
    ...updates,
    modifiedAt: new Date(),
    size: updates.content ? new Blob([updates.content]).size : file.size,
  };
  await fileDB.put(updatedFile);
  return updatedFile;
}

// 删除文件
export async function deleteFile(id: string): Promise<void> {
  // 递归删除子文件
  const children = await getFiles(id);
  for (const child of children) {
    await deleteFile(child.id);
  }
  await fileDB.delete(id);
}

// 移动文件
export async function moveFile(id: string, newParentId: string | null): Promise<FileNode | undefined> {
  return await updateFile(id, { parentId: newParentId });
}

// 复制文件
export async function copyFile(id: string, newParentId: string | null): Promise<FileNode | undefined> {
  const file = await fileDB.getById(id);
  if (!file) return undefined;

  const newFile = await createFile({
    ...file,
    name: `${file.name} (副本)`,
    parentId: newParentId,
  });
  return newFile;
}

// 搜索文件
export async function searchFiles(query: string): Promise<FileNode[]> {
  const allFiles = await fileDB.getAll();
  const lowerQuery = query.toLowerCase();
  return allFiles.filter((file) =>
    file.name.toLowerCase().includes(lowerQuery)
  );
}

// 过滤和排序文件
export function filterAndSortFiles(
  files: FileNode[],
  filter?: FileFilter,
  sort?: FileSort
): FileNode[] {
  let result = [...files];

  // 应用过滤
  if (filter) {
    if (filter.search) {
      const lowerSearch = filter.search.toLowerCase();
      result = result.filter((f) =>
        f.name.toLowerCase().includes(lowerSearch)
      );
    }
    if (filter.type) {
      result = result.filter((f) => f.type === filter.type);
    }
    if (filter.mimeType) {
      result = result.filter((f) => f.mimeType === filter.mimeType);
    }
  }

  // 应用排序
  if (sort) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'modifiedAt':
          comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  return result;
}

// 获取文件路径
export async function getFilePath(id: string): Promise<FileNode[]> {
  const path: FileNode[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const file = await getFile(currentId);
    if (file) {
      path.unshift(file);
      currentId = file.parentId;
    } else {
      break;
    }
  }

  return path;
}

// 检查文件权限
export function checkPermission(
  file: FileNode,
  permission: 'read' | 'write' | 'execute'
): boolean {
  return file.permissions[permission];
}
