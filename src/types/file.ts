// 文件系统类型定义

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content: string | null;
  mimeType: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  permissions: FilePermission;
  metadata: Record<string, unknown>;
}

export interface FilePermission {
  read: boolean;
  write: boolean;
  execute: boolean;
  owner: string;
  group: string;
}

export interface FileTree {
  [key: string]: FileNode[];
}

export type FileViewMode = 'grid' | 'list';

export interface FileFilter {
  search?: string;
  type?: 'file' | 'folder';
  mimeType?: string;
}

export interface FileSort {
  field: 'name' | 'size' | 'modifiedAt' | 'createdAt';
  order: 'asc' | 'desc';
}
