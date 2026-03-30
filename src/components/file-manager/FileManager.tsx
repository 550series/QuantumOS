'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFileStore } from '@/stores';
import { getFiles, createFile, deleteFile, initDefaultFileSystem } from '@/services/fileService';
import { Panel, Button } from '@/components/ui';
import type { FileNode } from '@/types';
import {
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  FolderPlus,
  FilePlus,
  Trash2,
  Grid,
  List,
  ChevronRight,
  ChevronDown,
  Home,
} from 'lucide-react';

// 文件图标映射
const getFileIcon = (file: FileNode) => {
  if (file.type === 'folder') return <Folder className="w-8 h-8" />;

  const mimeType = file.mimeType.toLowerCase();
  if (mimeType.startsWith('image/')) return <Image className="w-8 h-8" />;
  if (mimeType.startsWith('video/')) return <Video className="w-8 h-8" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8" />;
  if (mimeType.includes('text') || mimeType.includes('markdown')) {
    return <FileText className="w-8 h-8" />;
  }

  return <File className="w-8 h-8" />;
};

export const FileManager: React.FC = () => {
  const {
    files,
    currentPath,
    selectedFileId,
    viewMode,
    setFiles,
    selectFile,
    setCurrentPath,
    navigateToFolder,
    navigateUp,
    setViewMode,
  } = useFileStore();

  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string | null;
  } | null>(null);

  // 初始化文件系统
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initDefaultFileSystem();
      const rootFiles = await getFiles(null);
      setFiles(rootFiles);
      setLoading(false);
    };
    init();
  }, [setFiles]);

  // 加载当前目录文件
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
      const files = await getFiles(parentId);
      setFiles(files);
      setLoading(false);
    };
    loadFiles();
  }, [currentPath, setFiles]);

  // 处理文件双击
  const handleFileDoubleClick = (file: FileNode) => {
    if (file.type === 'folder') {
      navigateToFolder(file.id);
    } else {
      // TODO: 打开文件预览/编辑器
      console.log('Open file:', file);
    }
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, fileId: string | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  // 创建新文件夹
  const handleCreateFolder = async () => {
    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
    const folder = await createFile({
      name: '新建文件夹',
      type: 'folder',
      parentId,
      content: null,
      mimeType: 'inode/directory',
      size: 0,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'moss',
        group: 'users',
      },
      metadata: {},
    });
    const updatedFiles = await getFiles(parentId);
    setFiles(updatedFiles);
    setContextMenu(null);
  };

  // 创建新文件
  const handleCreateFile = async () => {
    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
    const file = await createFile({
      name: '新建文件.txt',
      type: 'file',
      parentId,
      content: '',
      mimeType: 'text/plain',
      size: 0,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'moss',
        group: 'users',
      },
      metadata: {},
    });
    const updatedFiles = await getFiles(parentId);
    setFiles(updatedFiles);
    setContextMenu(null);
  };

  // 删除文件
  const handleDelete = async () => {
    if (!selectedFileId) return;
    await deleteFile(selectedFileId);
    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
    const updatedFiles = await getFiles(parentId);
    setFiles(updatedFiles);
    selectFile(null);
    setContextMenu(null);
  };

  return (
    <Panel
      title="文件管理器"
      className="w-full h-full"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'text-moss-cyan' : 'text-moss-white/60'}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'text-moss-cyan' : 'text-moss-white/60'}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-moss-cyan/20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPath([])}
            disabled={currentPath.length === 0}
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateUp}
            disabled={currentPath.length === 0}
          >
            返回上一级
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCreateFolder}>
            <FolderPlus className="w-4 h-4 mr-1" />
            新建文件夹
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCreateFile}>
            <FilePlus className="w-4 h-4 mr-1" />
            新建文件
          </Button>
          {selectedFileId && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              删除
            </Button>
          )}
        </div>
      </div>

      {/* 路径面包屑 */}
      <div className="flex items-center gap-1 mb-4 text-xs text-moss-white/60 font-mono">
        <span
          className="cursor-pointer hover:text-moss-cyan"
          onClick={() => setCurrentPath([])}
        >
          /
        </span>
        {currentPath.map((id, index) => (
          <React.Fragment key={id}>
            <ChevronRight className="w-3 h-3" />
            <span className="cursor-pointer hover:text-moss-cyan">{id}</span>
          </React.Fragment>
        ))}
      </div>

      {/* 文件列表 */}
      <div
        className="flex-1 overflow-auto"
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64 text-moss-white/60">
            加载中...
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-6 gap-4">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`
                  flex flex-col items-center justify-center p-4 rounded cursor-pointer
                  border transition-all
                  ${
                    selectedFileId === file.id
                      ? 'border-moss-cyan bg-moss-cyan/10 shadow-neon'
                      : 'border-transparent hover:border-moss-cyan/30 hover:bg-moss-cyan/5'
                  }
                `}
                onClick={() => selectFile(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
              >
                <div className="text-moss-cyan mb-2">{getFileIcon(file)}</div>
                <span className="text-xs text-center text-moss-white/80 truncate w-full">
                  {file.name}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded cursor-pointer
                  border transition-all
                  ${
                    selectedFileId === file.id
                      ? 'border-moss-cyan bg-moss-cyan/10 shadow-neon'
                      : 'border-transparent hover:border-moss-cyan/30 hover:bg-moss-cyan/5'
                  }
                `}
                onClick={() => selectFile(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
              >
                <div className="text-moss-cyan">{getFileIcon(file)}</div>
                <span className="text-sm text-moss-white/80 flex-1">{file.name}</span>
                <span className="text-xs text-moss-white/40">
                  {file.size > 0 ? `${file.size} B` : '-'}
                </span>
                <span className="text-xs text-moss-white/40">
                  {new Date(file.modifiedAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {files.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-moss-white/40">
            <Folder className="w-16 h-16 mb-2" />
            <p>此文件夹为空</p>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 glass-panel py-2 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.fileId ? (
            <>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-moss-cyan/10 transition-colors"
                onClick={() => {
                  selectFile(contextMenu.fileId);
                  setContextMenu(null);
                }}
              >
                选择
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-cyber-red/10 text-cyber-red transition-colors"
                onClick={handleDelete}
              >
                删除
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-moss-cyan/10 transition-colors"
                onClick={handleCreateFolder}
              >
                新建文件夹
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-moss-cyan/10 transition-colors"
                onClick={handleCreateFile}
              >
                新建文件
              </button>
            </>
          )}
        </motion.div>
      )}
    </Panel>
  );
};
