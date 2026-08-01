import { describe, it, expect } from 'vitest';
import { buildTree } from '@/lib/db/buildTree';
import type { FileNode } from '@/types';

const base = {
  type: 'folder' as const,
  parentId: null,
  size: 0,
  createdAt: new Date(),
  modifiedAt: new Date(),
};

const makeFile = (overrides: Partial<FileNode> & { id: string; name: string }): FileNode => ({
  ...base,
  ...overrides,
});

describe('buildTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildTree([])).toEqual([]);
  });

  it('treats nodes without parentId as roots', () => {
    const a = makeFile({ id: 'a', name: 'A' });
    const b = makeFile({ id: 'b', name: 'B' });

    const tree = buildTree([a, b]);
    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe('a');
    expect(tree[1].id).toBe('b');
    expect(tree[0].level).toBe(0);
  });

  it('nests children under their parent and computes level', () => {
    const root = makeFile({ id: 'root', name: 'root' });
    const child = makeFile({ id: 'child', name: 'child', parentId: 'root' });
    const grandchild = makeFile({ id: 'gc', name: 'gc', parentId: 'child' });

    const tree = buildTree([grandchild, child, root]);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('root');
    expect(tree[0].level).toBe(0);

    const childNode = tree[0].children?.[0];
    expect(childNode?.id).toBe('child');
    expect(childNode?.level).toBe(1);

    const gcNode = childNode?.children?.[0];
    expect(gcNode?.id).toBe('gc');
    expect(gcNode?.level).toBe(2);
  });

  it('treats node with missing parent as a root', () => {
    const orphan = makeFile({ id: 'orphan', name: 'orphan', parentId: 'missing' });

    const tree = buildTree([orphan]);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('orphan');
    expect(tree[0].level).toBe(0);
    expect(tree[0].children).toBeUndefined();
  });

  it('does not mutate the original input objects', () => {
    const root = makeFile({ id: 'root', name: 'root' });
    const child = makeFile({ id: 'child', name: 'child', parentId: 'root' });
    const original = [root, child];

    buildTree(original);

    // 原对象不应被注入 level/children 字段
    expect('level' in root).toBe(false);
    expect('children' in root).toBe(false);
    expect('level' in child).toBe(false);
  });

  it('initializes expanded to false on all nodes', () => {
    const root = makeFile({ id: 'root', name: 'root' });
    const tree = buildTree([root]);
    expect(tree[0].expanded).toBe(false);
  });
});
