import type { FileNode } from '@/types';

export interface TreeNode extends FileNode {
  children?: TreeNode[];
  expanded?: boolean;
  level: number;
}

/**
 * 将扁平的 FileNode 列表构建为树形结构。
 *
 * - 以 `id` 为键建立索引；
 * - 通过 `parentId` 挂载到父节点的 `children`；
 * - 无 `parentId`（或父节点不存在）的节点视为根节点；
 * - 计算 `level` 用于渲染缩进。
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
    } else {
      // 无 parentId 或父节点不存在 -> 视为根节点（与文档约定一致）
      roots.push(node);
    }
  });

  // 单独计算 level，确保与输入顺序无关：先建树结构，再自顶向下赋值。
  const assignLevels = (node: TreeNode, level: number) => {
    node.level = level;
    node.children?.forEach((child) => assignLevels(child, level + 1));
  };
  roots.forEach((root) => assignLevels(root, 0));

  return roots;
}
