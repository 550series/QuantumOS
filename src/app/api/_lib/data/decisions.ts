import type { AIDecision } from '@/types';

import { InMemoryStore } from '../store';

// issue #39 修复：将 mock 数据迁移到共享 store，POST/GET/操作同一实例。
const initialDecisions: AIDecision[] = [
  {
    id: 'decision-1',
    type: 'resource_optimization',
    timestamp: new Date('2024-06-01T10:00:00Z'),
    confidence: 0.92,
    input: {
      context: 'CPU usage exceeded 85% on node-3 for 15 minutes',
      data: { cpuUsage: 87, memoryUsage: 62, nodeId: 'node-3' },
    },
    reasoning: [
      'CPU 使用率持续超过 85%',
      '节点 node-3 负载分布不均',
      '迁移部分任务可降低整体负载',
    ],
    recommendation: {
      action: '将 3 个批处理任务迁移至 node-2',
      parameters: { targetNode: 'node-2', taskCount: 3, priority: 'batch' },
      impact: {
        performance: 25,
        security: 0,
        stability: 10,
        userExperience: 15,
        description: '迁移后 node-3 CPU 预计降至 60%，node-2 CPU 升至 55%',
      },
      alternatives: [
        {
          action: '扩容 node-3 资源',
          parameters: { cpuCores: 4, memory: 8192 },
          pros: ['彻底解决问题', '无需迁移'],
          cons: ['成本增加', '需要停机扩容'],
        },
      ],
      urgency: 'high',
    },
    autoExecuted: false,
    humanApproval: null,
    status: 'pending',
  },
  {
    id: 'decision-2',
    type: 'risk_assessment',
    timestamp: new Date('2024-06-01T09:30:00Z'),
    confidence: 0.85,
    input: {
      context: '检测到异常登录尝试模式',
      data: { failedLogins: 23, sourceIp: '203.0.113.42', targetAccount: 'admin' },
    },
    reasoning: [
      '来自未知 IP 的连续登录失败',
      '目标为管理员账户',
      '符合暴力破解攻击模式',
    ],
    recommendation: {
      action: '临时封锁 IP 并通知安全团队',
      parameters: { blockDuration: 3600, notifyTeam: 'security', ipAddress: '203.0.113.42' },
      impact: {
        performance: 0,
        security: 80,
        stability: 0,
        userExperience: -5,
        description: '封锁该 IP 可阻止持续攻击，不影响正常用户',
      },
      alternatives: [
        {
          action: '仅记录日志，不做主动拦截',
          parameters: { logLevel: 'warn' },
          pros: ['零干扰'],
          cons: ['存在被攻破风险', '被动防御'],
        },
      ],
      urgency: 'critical',
    },
    autoExecuted: false,
    humanApproval: true,
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: new Date('2024-06-01T09:32:00Z'),
  },
  {
    id: 'decision-3',
    type: 'task_priority',
    timestamp: new Date('2024-06-01T11:00:00Z'),
    confidence: 0.78,
    input: {
      context: '系统维护窗口临近，多项任务排队中',
      data: { pendingTasks: 12, maintenanceWindow: '2024-06-01T14:00:00Z', sla: '99.9%' },
      constraints: { maxConcurrentTasks: 5, maintenanceDuration: 120 },
    },
    reasoning: [
      '维护窗口 2 小时后开始',
      '12 个待处理任务中有 4 个 SLA 相关',
      '并发上限为 5 个任务',
    ],
    recommendation: {
      action: '优先执行 SLA 关键任务，延迟非关键任务至维护后',
      parameters: {
        highPriorityTaskIds: ['task-3', 'task-7', 'task-9', 'task-11'],
        deferredTaskIds: ['task-5', 'task-6', 'task-8'],
      },
      impact: {
        performance: 15,
        security: 0,
        stability: 20,
        userExperience: 10,
        description: '确保 SLA 达标，维护窗口可正常进行',
      },
      alternatives: [
        {
          action: '推迟维护窗口',
          parameters: { newWindow: '2024-06-02T02:00:00Z' },
          pros: ['所有任务可在维护前完成'],
          cons: ['维护延期可能引入新风险', '变更计划需审批'],
        },
      ],
      urgency: 'medium',
    },
    autoExecuted: false,
    humanApproval: false,
    status: 'rejected',
  },
  {
    id: 'decision-4',
    type: 'system_maintenance',
    timestamp: new Date('2024-06-01T08:00:00Z'),
    confidence: 0.95,
    input: {
      context: '磁盘使用率达到 80%，需要清理',
      data: { diskUsage: 80, totalCapacity: 1000, largestDir: '/var/log' },
    },
    reasoning: [
      '磁盘使用率已超过预警阈值 75%',
      '/var/log 目录占用最大',
      '日志保留策略需要调整',
    ],
    recommendation: {
      action: '清理 30 天前的日志文件并压缩最近日志',
      parameters: { targetDir: '/var/log', retentionDays: 30, compressRecent: true },
      impact: {
        performance: 10,
        security: 0,
        stability: 5,
        userExperience: 0,
        description: '预计释放约 150GB 空间，磁盘使用率降至 65%',
      },
      alternatives: [
        {
          action: '扩容磁盘',
          parameters: { additionalCapacity: 500 },
          pros: ['一劳永逸'],
          cons: ['成本高', '需要停机'],
        },
      ],
      urgency: 'medium',
    },
    autoExecuted: true,
    humanApproval: null,
    status: 'executed',
  },
  {
    id: 'decision-5',
    type: 'anomaly_detection',
    timestamp: new Date('2024-06-01T12:00:00Z'),
    confidence: 0.71,
    input: {
      context: 'API 响应时间 P99 突然从 200ms 升至 1500ms',
      data: { p50: 120, p95: 450, p99: 1500, endpoint: '/api/data/query' },
    },
    reasoning: [
      'P99 延迟异常升高，P50 和 P95 正常',
      '仅影响 /api/data/query 端点',
      '可能存在慢查询或资源竞争',
    ],
    recommendation: {
      action: '分析慢查询日志并检查数据库连接池状态',
      parameters: { endpoint: '/api/data/query', checkDbPool: true, collectSlowQueries: true },
      impact: {
        performance: 30,
        security: 0,
        stability: 15,
        userExperience: 25,
        description: '定位慢查询根因后可恢复 P99 延迟至 300ms 以下',
      },
      alternatives: [
        {
          action: '重启数据库连接池',
          parameters: { poolName: 'data-query-pool' },
          pros: ['快速恢复'],
          cons: ['可能丢失根本原因', '短暂中断'],
        },
      ],
      urgency: 'high',
    },
    autoExecuted: false,
    humanApproval: null,
    status: 'pending',
  },
];

export const decisionStore = new InMemoryStore<AIDecision>(initialDecisions);