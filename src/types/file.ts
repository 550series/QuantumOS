export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string;
  size: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
}