'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';

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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';

import { Button, EmptyState } from '@/components/ui';
import { useAsyncInit } from '@/hooks/useAsyncInit';
import { fileDB, initDB, buildTree, type TreeNode } from '@/lib/db';
import type { FileNode } from '@/types';

type SortKey = 'name' | 'size' | 'modifiedAt';
type SortOrder = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  order: SortOrder;
}

// issue #53：排序
function compareNodes(a: TreeNode, b: TreeNode, key: SortKey): number {
  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, 'zh-CN');
    case 'size':
      return (a.size || 0) - (b.size || 0);
    case 'modifiedAt':
      return new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
    default:
      return 0;
  }
}

function sortTree(nodes: TreeNode[], key: SortKey, order: SortOrder): TreeNode[] {
  return nodes
    .map((n) => ({
      ...n,
      children: n.children ? sortTree(n.children, key, order) : n.children,
    }))
    .sort((a, b) => {
      const cmp = compareNodes(a, b, key);
      return order === 'asc' ? cmp : -cmp;
    });
}

export const FileExplorer: React.FC = () => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showNewInput, setShowNewInput] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [sort, setSort] = useState<SortState>({ key: 'name', order: 'asc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // 初始化：useAsyncInit 收敛 initDB + getAll + buildTree，返回扁平 files 与树
  const { data, loading, refresh } = useAsyncInit<{ files: FileNode[]; tree: TreeNode[] }>(
    async () => {
      await initDB();
      const allFiles = await fileDB.getAll();
      return { files: allFiles, tree: buildTree(allFiles) };
    },
    []
  );

  const files = useMemo(() => data?.files ?? [], [data]);

  // 树状态由本地维护（折叠/展开），数据刷新后同步
  useEffect(() => {
    if (data) {
      setTree(data.tree);
    }
  }, [data]);

  useEffect(() => {
    if (selectedFile) {
      const current = files.find((f) => f.id === selectedFile.id);
      setEditingContent(current?.content || '');
    }
  }, [selectedFile, files]);

  // issue #53：应用排序后的树
  const sortedTree = useMemo(() => sortTree(tree, sort.key, sort.order), [tree, sort]);

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

  // 切换排序
  const cycleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { key, order: 'asc' };
    });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectSingle = useCallback((node: TreeNode) => {
    setSelectedFile(node);
  }, []);

  const handleNodeClick = useCallback(
    (node: TreeNode, e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        toggleSelected(node.id);
        return;
      }
      if (e.shiftKey && selectedIds.size > 0) {
        // 简单范围选择：把当前节点加入选中
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.add(node.id);
          return next;
        });
        return;
      }
      setSelectedIds(new Set([node.id]));
      selectSingle(node);
      if (node.type === 'folder') toggleExpand(node.id);
    },
    [selectedIds, toggleSelected, selectSingle, toggleExpand]
  );

  // issue #53：收集某个节点的所有后代 id，避免把文件夹拖入自身子树
  const getDescendantIds = useCallback(
    (id: string): Set<string> => {
      const result = new Set<string>();
      const walk = (parentId: string) => {
        for (const f of files) {
          if (f.parentId === parentId && !result.has(f.id)) {
            result.add(f.id);
            walk(f.id);
          }
        }
      };
      walk(id);
      return result;
    },
    [files]
  );

  // issue #53：拖拽移动（把拖拽节点挂到目标文件夹下）
  const handleDrop = useCallback(
    async (targetFolderId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropTargetId(null);
      const draggedId = dragId;
      setDragId(null);
      if (!draggedId || draggedId === targetFolderId) return;

      const dragged = files.find((f) => f.id === draggedId);
      if (!dragged) return;

      const descendants = getDescendantIds(draggedId);
      if (descendants.has(targetFolderId)) return;

      try {
        await fileDB.put({ ...dragged, parentId: targetFolderId, modifiedAt: new Date() });
        refresh();
      } catch (err) {
        console.error('Failed to move:', err);
      }
    },
    [dragId, files, getDescendantIds, refresh]
  );

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
        refresh();
      } catch (err) {
        console.error('Failed to create:', err);
      }
    },
    [newItemName, refresh]
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
        setSelectedIds((prev) => {
          if (!prev.has(nodeId)) return prev;
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        refresh();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    },
    [files, selectedFile, refresh]
  );

  // issue #53：批量删除选中项
  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`确认删除选中的 ${ids.length} 个项目？`)) return;
    try {
      for (const id of ids) {
        await (async () => {
          const deleteRecursive = async (targetId: string) => {
            const children = files.filter((f) => f.parentId === targetId);
            for (const child of children) {
              await deleteRecursive(child.id);
            }
            await fileDB.delete(targetId);
          };
          await deleteRecursive(id);
        })();
      }
      setSelectedIds(new Set());
      setSelectedFile(null);
      refresh();
    } catch (err) {
      console.error('Failed to batch delete:', err);
    }
  }, [selectedIds, files, refresh]);

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
      refresh();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }, [selectedFile, editingContent, refresh]);

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const isFolder = node.type === 'folder';
    const isSelected = selectedFile?.id === node.id || selectedIds.has(node.id);
    const isExpanded = node.expanded;

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={(e) => {
            setDragId(node.id);
            e.dataTransfer.setData('text/plain', node.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            setDragId(null);
            setDropTargetId(null);
          }}
          onDragOver={(e) => {
            if (isFolder) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dropTargetId !== node.id) setDropTargetId(node.id);
            }
          }}
          onDragLeave={() => {
            if (dropTargetId === node.id) setDropTargetId(null);
          }}
          onDrop={
            isFolder
              ? (e) => {
                  handleDrop(node.id, e);
                }
              : undefined
          }
          className={`flex items-center gap-1 py-1 px-1 cursor-pointer hover:bg-moss-cyan/10 rounded transition-all ${
            isSelected ? 'bg-moss-cyan/20 border border-moss-cyan/30' : ''
          } ${isFolder && dropTargetId === node.id ? 'bg-moss-cyan/30 ring-1 ring-moss-cyan' : ''}`}
          style={{ paddingLeft: `${node.level * 16 + 4}px` }}
          onClick={(e) => handleNodeClick(node, e)}
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
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* issue #53：排序工具栏 */}
        <div className="p-1 border-b border-moss-cyan/20 flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-moss-white/40 flex-shrink-0" />
          {(['name', 'size', 'modifiedAt'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => cycleSort(key)}
              className={`px-1.5 py-0.5 font-mono text-[10px] border rounded flex items-center gap-0.5 transition-all ${
                sort.key === key
                  ? 'border-moss-cyan text-moss-cyan bg-moss-cyan/10'
                  : 'border-moss-white/20 text-moss-white/50 hover:border-moss-cyan/30'
              }`}
            >
              {key === 'name' ? '名称' : key === 'size' ? '大小' : '修改'}
              {sort.key === key ? (
                sort.order === 'asc' ? (
                  <ArrowUp className="w-2 h-2" />
                ) : (
                  <ArrowDown className="w-2 h-2" />
                )
              ) : null}
            </button>
          ))}
        </div>

        {/* issue #53：批量操作栏 */}
        {selectedIds.size > 1 && (
          <div className="p-1 border-b border-moss-cyan/20 flex items-center gap-2 bg-cyber-red/5">
            <span className="font-mono text-[10px] text-moss-white/70 flex-1">已选 {selectedIds.size} 项</span>
            <Button variant="danger" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

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
          ) : sortedTree.length === 0 ? (
            <EmptyState icon={Folder} message="暂无文件" className="py-8" iconClassName="w-8 h-8" />
          ) : (
            sortedTree.map(renderTreeNode)
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
                  {/* issue #53：文件夹可作为拖拽目标 */}
                  <div className="mt-6 flex items-center gap-2 text-xs text-moss-white/40">
                    <Upload className="w-4 h-4" />
                    可将文件拖拽到此文件夹移动
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-moss-white/20">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-sm">选择一个文件查看</p>
              <p className="font-mono text-xs mt-2 text-moss-white/30">
                Ctrl/Shift + 点击多选 · 拖拽文件到文件夹可移动 · 支持排序
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};