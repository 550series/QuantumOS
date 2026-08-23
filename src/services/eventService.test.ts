import { describe, it, expect, beforeEach } from 'vitest';

import { EventSystem } from '@/services/eventService';
import { useSystemStore } from '@/stores';

describe('EventSystem', () => {
  beforeEach(() => {
    useSystemStore.setState({ notifications: [] });
  });

  it('createEvent 新增事件并标记未解决', () => {
    const before = EventSystem.getEvents().length;

    const event = EventSystem.createEvent({
      type: 'network',
      severity: 'warning',
      title: '网络波动',
      description: '检测到短暂抖动',
      relatedTaskId: undefined,
    });

    const events = EventSystem.getEvents();
    expect(events.length).toBe(before + 1);
    expect(events[0].id).toBe(event.id);
    expect(event.resolved).toBe(false);
  });

  it('resolveEvent 将指定事件标记为解决', () => {
    const event = EventSystem.createEvent({
      type: 'system',
      severity: 'error',
      title: '服务异常',
      description: '检测到异常',
      relatedTaskId: undefined,
    });

    EventSystem.resolveEvent(event.id);
    const resolved = EventSystem.getEvents().find((e) => e.id === event.id);
    expect(resolved?.resolved).toBe(true);
    expect(resolved?.resolvedAt).toBeInstanceOf(Date);
  });

  it('未解决事件列表只包含未解决事件', () => {
    const event = EventSystem.createEvent({
      type: 'system',
      severity: 'warning',
      title: '待处理',
      description: 'desc',
      relatedTaskId: undefined,
    });

    const unresolved = EventSystem.getUnresolvedEvents();
    expect(unresolved.some((e) => e.id === event.id)).toBe(true);
    expect(unresolved.every((e) => e.resolved === false)).toBe(true);
  });

  it('事件创建会触发系统通知', () => {
    EventSystem.createEvent({
      type: 'security',
      severity: 'critical',
      title: '安全告警',
      description: '威胁',
      relatedTaskId: undefined,
    });

    const notifications = useSystemStore.getState().notifications;
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toBe('安全告警');
  });
});