'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Folder,
  File,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { fileDB, initDB } from '@/lib/db';
import type { FileNode } from '@/types';
import { Button } from '@/components/ui';

interface TreeNode extends FileNode {
  children?: TreeNode[];
  expanded?: boolean;
  level: number;
}

function buildTree(files: FileNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  files.forEach((f) => {
    map.set(f.id, { ...f, level: 0, expanded: false });
  });

  files.forEach((f) => {
    const node = map.get(f.id)!;
    if (f.parentId && map.has(f.parentId)) {
      const parent = map.get(f.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
      node.level = parent.level + 1;
    } else if (!f.parentId) {
      roots.push(node);
    }
  });

  return roots;
}

export const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showNewInput, setShowNewInput] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      await initDB();
      const allFiles = await fileDB.getAll();
      setFiles(allFiles);
      const fileTree = buildTree(allFiles);
      setTree(fileTree);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (selectedFile) {
      const current = files.find((f) => f.id === selectedFile.id);
      setEditingContent(current?.content || '');
    }
  }, [selectedFile, files]);

  const toggleExpand = useCallback((nodeId: string) => {
    const toggle = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, expanded: !n.expanded };
        }
        if (n.children) {
          return { ...n, children: toggle(n.children) };
        }
        return n;
      });
    setTree((prev) => toggle(prev));
  }, []);

  const selectFile = useCallback((node: TreeNode) => {
    setSelectedFile(node);
  }, []);

  const handleCreate = useCallback(
    async (parentId: string | null, type: 'file' | 'folder') => {
      if (!newItemName.trim()) return;
      const now = new Date();
      const newNode: FileNode = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: newItemName.trim(),
        type,
        parentId,
        content: type === 'file' ? '' : undefined,
        size: 0,
        createdAt: now,
        modifiedAt: now,
      };
      try {
        await fileDB.put(newNode);
        setNewItemName('');
        setShowNewInput(null);
        await loadFiles();
      } catch (err) {
        console.error('Failed to create:', err);
      }
    },
    [newItemName, loadFiles]
  );

  const handleDelete = useCallback(
    async (nodeId: string) => {
      const deleteRecursive = async (id: string) => {
        const children = files.filter((f) => f.parentId === id);
        for (const child of children) {
          await deleteRecursive(child.id);
        }
        await fileDB.delete(id);
      };
      try {
        await deleteRecursive(nodeId);
        if (selectedFile?.id === nodeId) setSelectedFile(null);
        await loadFiles();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    },
    [files, selectedFile, loadFiles]
  );

  const handleSaveContent = useCallback(async () => {
    if (!selectedFile || selectedFile.type !== 'file') return;
    try {
      const updated = {
        ...selectedFile,
        content: editingContent,
        size: new Blob([editingContent]).size,
        modifiedAt: new Date(),
        children: undefined,
        expanded: undefined,
        level: undefined,
      } as FileNode;
      await fileDB.put(updated);
      await loadFiles();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }, [selectedFile, editingContent, loadFiles]);

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const isFolder = node.type === 'folder';
    const isSelected = selectedFile?.id === node.id;
    const isExpanded = node.expanded;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1 px-1 cursor-pointer hover:bg-moss-cyan/10 rounded transition-all ${
            isSelected ? 'bg-moss-cyan/20 border border-moss-cyan/30' : ''
          }`}
          style={{ paddingLeft: `${node.level * 16 + 4}px` }}
          onClick={() => {
            if (isFolder) toggleExpand(node.id);
            selectFile(node);
          }}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-moss-cyan flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-moss-cyan flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-moss-cyan flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-moss-cyan flex-shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3 h-3 flex-shrink-0" />
              <FileText className="w-4 h-4 text-moss-white/60 flex-shrink-0" />
            </>
          )}
          <span className="font-mono text-xs text-moss-white truncate">{node.name}</span>
          {!isFolder && (
            <span className="font-mono text-xs text-moss-white/30 ml-auto flex-shrink-0">
              {node.size > 1024 ? `${(node.size / 1024).toFixed(1)}KB` : `${node.size}B`}
            </span>
          )}
        </div>
        {isFolder && isExpanded && node.children?.map(renderTreeNode)}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-moss-cyan/20 flex flex-col">
        <div className="p-2 border-b border-moss-cyan/20 flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowNewInput({ parentId: null, type: 'folder' })}>
            <Plus className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNewInput({ parentId: null, type: 'file' })}>
            <File className="w-3 h-3" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={loadFiles}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {showNewInput && (
          <div className="p-2 border-b border-moss-cyan/20 flex items-center gap-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate(showNewInput.parentId, showNewInput.type);
                if (e.key === 'Escape') setShowNewInput(null);
              }}
              placeholder={showNewInput.type === 'folder' ? '文件夹名称...' : '文件名...'}
              className="flex-1 text-xs px-2 py-1"
              autoFocus
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-moss-white/40 text-xs font-mono">
              加载中...
            </div>
          ) : tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-moss-white/30">
              <Folder className="w-8 h-8 mb-2 opacity-30" />
              <p className="font-mono text-xs">暂无文件</p>
            </div>
          ) : (
            tree.map(renderTreeNode)
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-2 border-b border-moss-cyan/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile.type === 'folder' ? (
                  <Folder className="w-4 h-4 text-moss-cyan" />
                ) : (
                  <FileText className="w-4 h-4 text-moss-white/60" />
                )}
                <span className="font-mono text-xs text-moss-white">{selectedFile.name}</span>
                <span className="font-mono text-xs text-moss-white/30">
                  {new Date(selectedFile.modifiedAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedFile.id)}>
                <Trash2 className="w-3 h-3 text-cyber-red" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {selectedFile.type === 'file' ? (
                <div className="h-full flex flex-col gap-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="flex-1 bg-dark-800 border border-moss-cyan/20 rounded p-3 font-mono text-sm text-moss-white resize-none focus:border-moss-cyan focus:ring-1 focus:ring-moss-cyan/30"
                    placeholder="文件内容..."
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleSaveContent}>
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-moss-white/30">
                  <FolderOpen className="w-16 h-16 mb-3 opacity-30" />
                  <p className="font-mono text-sm">文件夹: {selectedFile.name}</p>
                  <p className="font-mono text-xs mt-1">
                    {files.filter((f) => f.parentId === selectedFile.id).length} 个项目
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-moss-white/20">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-sm">选择一个文件查看</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};