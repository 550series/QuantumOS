import { v4 as uuidv4 } from 'uuid';

import { MOSSDecisionEngine } from '@/lib/ai/decisionEngine';
import { useSystemStore } from '@/stores';
import { useAIStore } from '@/stores';
import { useTaskStore } from '@/stores';
import type { Task } from '@/types';

// 事件类型
export type EventType = 'system' | 'security' | 'performance' | 'network' | 'storage';

// 事件严重程度
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

// 系统事件接口
export interface SystemEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  relatedTaskId?: string;
}

// 预设事件模板
const eventTemplates: Array<{
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  probability: number;
  taskCreation: boolean;
  taskTitle?: string;
  taskDescription?: string;
}> = [
  {
    type: 'system',
    severity: 'info',
    title: '系统启动完成',
    description: '系统已成功启动，所有服务正常运行',
    probability: 5,
    taskCreation: false,
  },
  {
    type: 'system',
    severity: 'warning',
    title: '系统负载增加',
    description: '系统负载持续增加，可能需要优化资源',
    probability: 15,
    taskCreation: true,
    taskTitle: '优化系统资源',
    taskDescription: '分析系统负载情况，优化资源分配',
  },
  {
    type: 'security',
    severity: 'error',
    title: '安全扫描发现漏洞',
    description: '定期安全扫描发现潜在漏洞，需要及时修复',
    probability: 8,
    taskCreation: true,
    taskTitle: '修复安全漏洞',
    taskDescription: '处理安全扫描发现的漏洞',
  },
  {
    type: 'performance',
    severity: 'warning',
    title: '服务响应时间延长',
    description: '核心服务响应时间超过正常阈值',
    probability: 12,
    taskCreation: true,
    taskTitle: '优化服务性能',
    taskDescription: '分析并优化服务响应时间',
  },
  {
    type: 'network',
    severity: 'error',
    title: '网络连接中断',
    description: '检测到网络连接短暂中断',
    probability: 10,
    taskCreation: false,
  },
  {
    type: 'storage',
    severity: 'warning',
    title: '存储空间不足',
    description: '系统存储空间使用率超过80%',
    probability: 10,
    taskCreation: true,
    taskTitle: '清理存储空间',
    taskDescription: '清理不必要的文件和数据',
  },
  {
    type: 'system',
    severity: 'critical',
    title: '服务崩溃',
    description: '核心服务意外崩溃，需要立即处理',
    probability: 3,
    taskCreation: true,
    taskTitle: '恢复核心服务',
    taskDescription: '紧急恢复崩溃的核心服务',
  },
  {
    type: 'security',
    severity: 'critical',
    title: '可疑登录尝试',
    description: '检测到多次失败的登录尝试',
    probability: 5,
    taskCreation: true,
    taskTitle: '调查可疑登录',
    taskDescription: '分析可疑登录尝试，加强安全措施',
  },
];

export class EventSystem {
  private static events: SystemEvent[] = [];
  private static eventInterval: NodeJS.Timeout | null = null;
  // issue #57：锁屏时后台暂停
  private static running = false;
  private static locked = false;
  private static unsubscribeLock: (() => void) | null = null;

  // 启动事件系统
  static startEventGeneration() {
    this.running = true;
    this.watchLockState();
    this.startTimers();
  }

  // 订阅锁屏状态：锁屏暂停，解锁后恢复（issue #57）
  private static watchLockState() {
    if (this.unsubscribeLock) return;
    this.locked = useSystemStore.getState().isLocked;
    this.unsubscribeLock = useSystemStore.subscribe((state) => {
      const wasLocked = this.locked;
      this.locked = state.isLocked;
      if (wasLocked === this.locked) return;
      if (this.locked) {
        EventSystem.pauseEventGeneration();
      } else if (this.running) {
        EventSystem.startTimers();
      }
    });
  }

  // 启动内部定时器（解锁/启动时调用）
  private static startTimers() {
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
    }
    this.eventInterval = setInterval(() => {
      this.generateRandomEvent();
    }, 15000);
    this.generateRandomEvent();
  }

  // 暂停事件生成（清理定时器，状态由 running 区分）
  private static pauseEventGeneration() {
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
    }
  }

  // 停止事件系统
  static stopEventGeneration() {
    this.running = false;
    if (this.unsubscribeLock) {
      this.unsubscribeLock();
      this.unsubscribeLock = null;
    }
    this.pauseEventGeneration();
  }

  // 生成随机事件
  private static async generateRandomEvent() {
    try {
      // 根据概率选择事件
      const weightedEvents = eventTemplates.flatMap(template => {
        const copies = Math.floor(template.probability / 2); // 每2%概率生成一个副本
        return Array(copies).fill(template);
      });

      if (weightedEvents.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * weightedEvents.length);
      const template = weightedEvents[randomIndex];

      // 创建事件
      const event: SystemEvent = {
        id: uuidv4(),
        type: template.type,
        severity: template.severity,
        title: template.title,
        description: template.description,
        timestamp: new Date(),
        resolved: false,
      };

      // 添加到事件列表
      this.events.unshift(event);
      this.events = this.events.slice(0, 100); // 只保留最新的100个事件

      // 添加系统通知
      const systemStore = useSystemStore.getState();
      systemStore.addNotification({
        title: event.title,
        message: event.description,
        type: event.severity === 'critical' ? 'error' : event.severity,
      });

      // 添加MOSS消息
      const aiStore = useAIStore.getState();
      aiStore.addMessage({
        type: event.severity === 'error' || event.severity === 'critical' ? 'warning' : 'info',
        content: `检测到${event.title}，${event.description}`,
      });

      // 创建相关任务
      if (template.taskCreation && template.taskTitle && template.taskDescription) {
        const taskStore = useTaskStore.getState();
        const newTask: Task = {
          id: uuidv4(),
          name: template.taskTitle,
          description: template.taskDescription,
          status: 'pending',
          priority: event.severity === 'critical' ? 'critical' : event.severity === 'error' ? 'high' : 'normal',
          progress: 0,
          dependencies: [],
          scheduledAt: null,
          startedAt: null,
          completedAt: null,
          result: null,
          error: null,
          resources: {
            cpu: 0,
            memory: 0,
            network: 0,
          },
          metadata: {
            category: 'system',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        taskStore.addTask(newTask);
        event.relatedTaskId = newTask.id;
      }

      // 严重事件真正触发 MOSS 决策引擎
      if (event.severity === 'error' || event.severity === 'critical') {
        const decision = await MOSSDecisionEngine.analyze({
          context: `系统事件: ${event.title}`,
          data: {
            riskScore: event.severity === 'critical' ? 90 : 75,
            riskType: event.type,
          },
        });
        if (decision) {
          useAIStore.getState().addDecision(decision);
        }
      }
    } catch (err) {
      // 单次事件生成失败不应中断整个事件系统
      console.error('[EventSystem] 生成事件失败:', err);
    }
  }

  // 获取所有事件
  static getEvents(): SystemEvent[] {
    return this.events;
  }

  // 获取未解决的事件
  static getUnresolvedEvents(): SystemEvent[] {
    return this.events.filter(event => !event.resolved);
  }

  // 解决事件
  static resolveEvent(eventId: string) {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = new Date();

      // 添加系统通知
      const systemStore = useSystemStore.getState();
      systemStore.addNotification({
        title: `事件已解决: ${event.title}`,
        message: '事件已成功处理',
        type: 'success',
      });

      // 添加MOSS消息
      const aiStore = useAIStore.getState();
      aiStore.addMessage({
        type: 'success',
        content: `${event.title}已解决，系统状态已恢复正常。`,
      });
    }
  }

  // 手动创建事件
  static createEvent(event: Omit<SystemEvent, 'id' | 'timestamp' | 'resolved'>) {
    const newEvent: SystemEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
      resolved: false,
    };

    this.events.unshift(newEvent);
    this.events = this.events.slice(0, 100);

    // 添加系统通知
    const systemStore = useSystemStore.getState();
    systemStore.addNotification({
      title: event.title,
      message: event.description,
      type: event.severity === 'critical' ? 'error' : event.severity,
    });

    return newEvent;
  }
}
