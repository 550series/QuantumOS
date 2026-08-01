import { describe, it, expect } from 'vitest';
import {
  getSeverityStyle,
  getNotificationTypeStyle,
  getTaskStatusStyle,
  getTaskPriorityColor,
  getUrgencyColor,
} from '@/lib/theme/severityTheme';

describe('severityTheme', () => {
  describe('getSeverityStyle', () => {
    it('returns style for each log/alert severity level', () => {
      const levels = ['info', 'warning', 'error', 'critical'] as const;
      for (const level of levels) {
        const style = getSeverityStyle(level);
        expect(style).toBeDefined();
        expect(style.icon).toBeDefined();
        expect(style.color).toBeTruthy();
        expect(style.label).toBeTruthy();
      }
    });

    it('uses pulse animation only for critical severity', () => {
      expect(getSeverityStyle('critical').color).toContain('animate-pulse');
      expect(getSeverityStyle('info').color).not.toContain('animate-pulse');
      expect(getSeverityStyle('error').color).not.toContain('animate-pulse');
    });
  });

  describe('getNotificationTypeStyle', () => {
    it('returns a distinct style for each notification type', () => {
      const types = ['info', 'success', 'warning', 'error'] as const;
      const labels = types.map((t) => getNotificationTypeStyle(t).label);
      expect(new Set(labels).size).toBe(types.length);
    });

    it('uses green color for success notifications', () => {
      expect(getNotificationTypeStyle('success').color).toContain('cyber-green');
    });
  });

  describe('getTaskStatusStyle', () => {
    it('returns an icon and color for each task status', () => {
      const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const;
      for (const status of statuses) {
        const style = getTaskStatusStyle(status);
        expect(style.icon).toBeDefined();
        expect(style.color).toBeTruthy();
      }
    });

    it('marks running tasks with animate-pulse', () => {
      expect(getTaskStatusStyle('running').iconClassName).toContain('animate-pulse');
    });
  });

  describe('getTaskPriorityColor', () => {
    it('returns red for critical priority', () => {
      expect(getTaskPriorityColor('critical')).toContain('cyber-red');
    });

    it('returns orange for high priority', () => {
      expect(getTaskPriorityColor('high')).toContain('cyber-orange');
    });

    it('returns muted color for low priority', () => {
      expect(getTaskPriorityColor('low')).toContain('moss-white');
    });
  });

  describe('getUrgencyColor', () => {
    it('returns distinct colors for each urgency level', () => {
      const urgencies = ['low', 'medium', 'high', 'critical'] as const;
      const colors = urgencies.map((u) => getUrgencyColor(u));
      expect(new Set(colors).size).toBe(urgencies.length);
    });

    it('uses pulse animation only for critical urgency', () => {
      expect(getUrgencyColor('critical')).toContain('animate-pulse');
      expect(getUrgencyColor('high')).not.toContain('animate-pulse');
    });
  });
});
