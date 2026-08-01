import { describe, it, expect } from 'vitest';

import type { FileNode } from '@/types';

import { buildTree } from './buildTree';

const now = new Date('2026-01-01T00:00:00Z');

function makeFile(overrides: Partial<FileNode>): FileNode {
  return {
    id: 'file',
    name: 'file',
    type: 'file',
    parentId: null,
    size: 0,
    createdAt: now,
    modifiedAt: now,
    ...overrides,
  };
}

describe('buildTree', () => {
  it('空数组返回空根列表', () => {
    expect(buildTree([])).toEqual([]);
  });

  it('无 parentId 的节点作为根，level 为 0', () => {
    const root = makeFile({ id: 'root', name: 'root', type: 'folder' });
    const tree = buildTree([root]);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('root');
    expect(tree[0].level).toBe(0);
    expect(tree[0].children).toBeUndefined();
  });

  it('子节点挂载到对应父节点，并设置 level', () => {
    const root = makeFile({ id: 'root', type: 'folder' });
    const child = makeFile({ id: 'child', parentId: 'root' });

    const tree = buildTree([root, child]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children![0].id).toBe('child');
    expect(tree[0].children![0].level).toBe(1);
  });

  it('parentId 指向不存在节点的孤儿项被忽略（不入根也不挂载）', () => {
    const orphan = makeFile({ id: 'orphan', parentId: 'missing' });

    const tree = buildTree([orphan]);

    expect(tree).toEqual([]);
  });

  it('支持多级嵌套，level 逐层递增', () => {
    const root = makeFile({ id: 'root', type: 'folder' });
    const mid = makeFile({ id: 'mid', type: 'folder', parentId: 'root' });
    const leaf = makeFile({ id: 'leaf', parentId: 'mid' });

    const tree = buildTree([root, mid, leaf]);

    expect(tree[0].level).toBe(0);
    expect(tree[0].children![0].id).toBe('mid');
    expect(tree[0].children![0].level).toBe(1);
    expect(tree[0].children![0].children![0].id).toBe('leaf');
    expect(tree[0].children![0].children![0].level).toBe(2);
  });

  it('子节点出现在父节点之前也能正确挂载', () => {
    const child = makeFile({ id: 'child', parentId: 'root' });
    const root = makeFile({ id: 'root', type: 'folder' });

    const tree = buildTree([child, root]);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('root');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children![0].id).toBe('child');
    expect(tree[0].children![0].level).toBe(1);
  });

  it('多个根节点都被收集', () => {
    const root1 = makeFile({ id: 'r1', type: 'folder' });
    const root2 = makeFile({ id: 'r2', type: 'folder' });

    const tree = buildTree([root1, root2]);

    expect(tree).toHaveLength(2);
    expect(tree.map((n) => n.id).sort()).toEqual(['r1', 'r2']);
  });

  it('不修改原始输入数组', () => {
    const root = makeFile({ id: 'root', type: 'folder' });
    const original = [root];

    buildTree(original);

    expect(original).toHaveLength(1);
    expect(original[0]).toBe(root);
  });

  it('节点初始化时 expanded 为 false', () => {
    const root = makeFile({ id: 'root', type: 'folder' });

    const tree = buildTree([root]);

    expect(tree[0].expanded).toBe(false);
  });
});
