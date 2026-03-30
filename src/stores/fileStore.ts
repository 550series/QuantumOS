import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FileNode, FileViewMode, FileFilter, FileSort } from '@/types';

interface FileState {
  // 文件数据
  files: FileNode[];
  currentPath: string[];
  selectedFileId: string | null;

  // 视图设置
  viewMode: FileViewMode;
  filter: FileFilter;
  sort: FileSort;

  // 操作状态
  loading: boolean;
  error: string | null;

  // 操作方法
  setFiles: (files: FileNode[]) => void;
  addFile: (file: FileNode) => void;
  updateFile: (id: string, updates: Partial<FileNode>) => void;
  deleteFile: (id: string) => void;

  // 导航操作
  setCurrentPath: (path: string[]) => void;
  navigateToFolder: (folderId: string) => void;
  navigateUp: () => void;

  // 选择操作
  selectFile: (id: string | null) => void;

  // 视图操作
  setViewMode: (mode: FileViewMode) => void;
  setFilter: (filter: FileFilter) => void;
  setSort: (sort: FileSort) => void;

  // 状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FileState>()(
  immer((set, get) => ({
    // 初始状态
    files: [],
    currentPath: [],
    selectedFileId: null,
    viewMode: 'grid',
    filter: {},
    sort: { field: 'name', order: 'asc' },
    loading: false,
    error: null,

    // 文件操作
    setFiles: (files) =>
      set((state) => {
        state.files = files;
      }),

    addFile: (file) =>
      set((state) => {
        state.files.push(file);
      }),

    updateFile: (id, updates) =>
      set((state) => {
        const index = state.files.findIndex((f) => f.id === id);
        if (index !== -1) {
          state.files[index] = { ...state.files[index], ...updates };
        }
      }),

    deleteFile: (id) =>
      set((state) => {
        state.files = state.files.filter((f) => f.id !== id);
        if (state.selectedFileId === id) {
          state.selectedFileId = null;
        }
      }),

    // 导航操作
    setCurrentPath: (path) =>
      set((state) => {
        state.currentPath = path;
      }),

    navigateToFolder: (folderId) =>
      set((state) => {
        const folder = state.files.find((f) => f.id === folderId);
        if (folder && folder.type === 'folder') {
          state.currentPath.push(folderId);
        }
      }),

    navigateUp: () =>
      set((state) => {
        if (state.currentPath.length > 0) {
          state.currentPath.pop();
        }
      }),

    // 选择操作
    selectFile: (id) =>
      set((state) => {
        state.selectedFileId = id;
      }),

    // 视图操作
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setFilter: (filter) =>
      set((state) => {
        state.filter = { ...state.filter, ...filter };
      }),

    setSort: (sort) =>
      set((state) => {
        state.sort = sort;
      }),

    // 状态操作
    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);
