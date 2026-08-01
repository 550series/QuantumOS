import type { FileNode } from '@/types';

/**
 * 文件树节点：在 FileNode 基础上附加运行时层级信息。
 * 用于 FileExplorer 的树状渲染。
 */
export interface TreeNode extends FileNode {
  children?: TreeNode[];
  expanded?: boolean;
  level: number;
}

/**
 * 根据扁平 FileNode 列表构建层级树。
 *
 * - 无 parentId 的节点作为根。
 * - parentId 指向不存在节点的项被忽略（不挂载、不入根）。
 * - level 从根开始递增（根为 0）。
 *
 * 抽离自 FileExplorer.tsx（issue #27 / #30），便于单测覆盖。
 */
export function buildTree(files: FileNode[]): TreeNode[] {
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
