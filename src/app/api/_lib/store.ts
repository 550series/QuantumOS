// 服务端共享的内存存储（issue #39 修复）
//
// 原本每个 route 文件各自持有模块级数组，POST 创建的对象既不 push 也不共享，
// 导致 GET / PUT / DELETE 与 POST 之间数据不一致。此处提供通用的、跨 handler
// 共享的内存 CRUD，作为服务端持久层的替身（本仓库前端实际走 IndexedDB）。
//
// 注意：Next.js 按需构建时同一模块可被多个 handler 共享同一实例，
// 由此 POST 创建的数据在 GET / PUT / DELETE 中保持一致。

export class InMemoryStore<T extends { id: string }> {
  private items: T[];

  constructor(initial: T[] = []) {
    this.items = [...initial];
  }

  // 返回副本，避免调用方直接改动内部数组
  list(): T[] {
    return [...this.items];
  }

  get(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  create(item: T): T {
    this.items.unshift(item);
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    const updated = { ...this.items[index], ...patch, id } as T;
    this.items[index] = updated;
    return updated;
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}