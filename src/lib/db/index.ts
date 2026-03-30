import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { FileNode, Task, AIDecision, LogEntry, Alert, SystemConfig } from '@/types';

// 数据库Schema定义
interface QuantumOSDB extends DBSchema {
  files: {
    key: string;
    value: FileNode;
    indexes: {
      'by-name': string;
      'by-parent': string;
      'by-type': string;
      'by-modified': Date;
    };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': string;
      'by-priority': string;
      'by-scheduled': Date;
      'by-created': Date;
    };
  };
  decisions: {
    key: string;
    value: AIDecision;
    indexes: {
      'by-type': string;
      'by-timestamp': Date;
      'by-status': string;
    };
  };
  logs: {
    key: string;
    value: LogEntry;
    indexes: {
      'by-level': string;
      'by-category': string;
      'by-timestamp': Date;
      'by-source': string;
    };
  };
  alerts: {
    key: string;
    value: Alert;
    indexes: {
      'by-severity': string;
      'by-timestamp': Date;
      'by-acknowledged': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'QuantumOS';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<QuantumOSDB> | null = null;

// 初始化数据库
export async function initDB(): Promise<IDBPDatabase<QuantumOSDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<QuantumOSDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 文件存储
      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('by-name', 'name');
        fileStore.createIndex('by-parent', 'parentId');
        fileStore.createIndex('by-type', 'type');
        fileStore.createIndex('by-modified', 'modifiedAt');
      }

      // 任务存储
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-priority', 'priority');
        taskStore.createIndex('by-scheduled', 'scheduledAt');
        taskStore.createIndex('by-created', 'createdAt');
      }

      // AI决策存储
      if (!db.objectStoreNames.contains('decisions')) {
        const decisionStore = db.createObjectStore('decisions', { keyPath: 'id' });
        decisionStore.createIndex('by-type', 'type');
        decisionStore.createIndex('by-timestamp', 'timestamp');
        decisionStore.createIndex('by-status', 'status');
      }

      // 日志存储
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        logStore.createIndex('by-level', 'level');
        logStore.createIndex('by-category', 'category');
        logStore.createIndex('by-timestamp', 'timestamp');
        logStore.createIndex('by-source', 'source');
      }

      // 警报存储
      if (!db.objectStoreNames.contains('alerts')) {
        const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
        alertStore.createIndex('by-severity', 'severity');
        alertStore.createIndex('by-timestamp', 'timestamp');
        alertStore.createIndex('by-acknowledged', 'acknowledged');
      }

      // 设置存储
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });

  return dbInstance;
}

// 获取数据库实例
export async function getDB(): Promise<IDBPDatabase<QuantumOSDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// 通用CRUD操作
export class DatabaseService<T> {
  constructor(private storeName: string) {}

  async getAll(): Promise<T[]> {
    const db = await getDB();
    return db.getAll(this.storeName as any) as Promise<T[]>;
  }

  async getById(id: string): Promise<T | undefined> {
    const db = await getDB();
    return db.get(this.storeName as any, id) as Promise<T | undefined>;
  }

  async add(item: T): Promise<string> {
    const db = await getDB();
    return db.add(this.storeName as any, item as any) as Promise<string>;
  }

  async put(item: T): Promise<string> {
    const db = await getDB();
    return db.put(this.storeName as any, item as any) as Promise<string>;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    return db.delete(this.storeName as any, id);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    return db.clear(this.storeName as any);
  }

  async count(): Promise<number> {
    const db = await getDB();
    return db.count(this.storeName as any);
  }
}

// 导出各个实体的数据库服务
export const fileDB = new DatabaseService<FileNode>('files');
export const taskDB = new DatabaseService<Task>('tasks');
export const decisionDB = new DatabaseService<AIDecision>('decisions');
export const logDB = new DatabaseService<LogEntry>('logs');
export const alertDB = new DatabaseService<Alert>('alerts');

// 设置相关操作
export async function getSetting<K extends keyof SystemConfig>(
  key: K
): Promise<SystemConfig[K] | undefined> {
  const db = await getDB();
  return db.get('settings' as any, key) as Promise<SystemConfig[K] | undefined>;
}

export async function setSetting<K extends keyof SystemConfig>(
  key: K,
  value: SystemConfig[K]
): Promise<void> {
  const db = await getDB();
  await db.put('settings' as any, value as any, key);
}

export async function getAllSettings(): Promise<Partial<SystemConfig>> {
  const db = await getDB();
  const keys = (await db.getAllKeys('settings' as any)) as (keyof SystemConfig)[];
  const settings: Partial<SystemConfig> = {};

  for (const key of keys) {
    const value = await db.get('settings' as any, key);
    if (value !== undefined) {
      settings[key] = value as any;
    }
  }

  return settings;
}

// 默认设置
export const defaultSettings: SystemConfig = {
  theme: 'dark',
  animationsEnabled: true,
  soundEnabled: true,
  notificationsEnabled: true,
  language: 'zh-CN',
  autoUpdate: true,
};

// 初始化默认设置
export async function initDefaultSettings(): Promise<void> {
  const currentSettings = await getAllSettings();

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!(key in currentSettings)) {
      await setSetting(key as keyof SystemConfig, value as never);
    }
  }
}
