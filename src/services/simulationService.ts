import { useSystemStore } from '@/stores';
import { useAIStore } from '@/stores';
import { MOSSDecisionEngine } from '@/lib/ai/decisionEngine';
import { v4 as uuidv4 } from 'uuid';

// 场景类型
export type ScenarioType = 'normal' | 'emergency' | 'warning' | 'optimization';

// 模拟场景接口
export interface SimulationScenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  probability: number; // 0-100
  systemImpact: {
    cpu: number;
    memory: number;
    network: {
      upload: number;
      download: number;
    };
  };
  triggerDelay: number; // 毫秒
  duration: number; // 毫秒
  resolved: boolean;
  startTime?: Date;
  endTime?: Date;
}

// 预设场景
const defaultScenarios: SimulationScenario[] = [
  {
    id: 'scenario-1',
    type: 'normal',
    name: '系统常规运行',
    description: '系统在正常负载下运行',
    probability: 70,
    systemImpact: {
      cpu: 30,
      memory: 40,
      network: {
        upload: 100,
        download: 200,
      },
    },
    triggerDelay: 0,
    duration: 60000,
    resolved: true,
  },
  {
    id: 'scenario-2',
    type: 'warning',
    name: 'CPU负载增加',
    description: '系统CPU负载逐渐增加',
    probability: 15,
    systemImpact: {
      cpu: 75,
      memory: 45,
      network: {
        upload: 150,
        download: 300,
      },
    },
    triggerDelay: 10000,
    duration: 45000,
    resolved: false,
  },
  {
    id: 'scenario-3',
    type: 'emergency',
    name: '系统资源耗尽',
    description: '系统资源接近耗尽，需要紧急处理',
    probability: 5,
    systemImpact: {
      cpu: 95,
      memory: 90,
      network: {
        upload: 500,
        download: 800,
      },
    },
    triggerDelay: 5000,
    duration: 30000,
    resolved: false,
  },
  {
    id: 'scenario-4',
    type: 'optimization',
    name: '资源优化机会',
    description: '发现资源优化机会，可提升系统性能',
    probability: 10,
    systemImpact: {
      cpu: 60,
      memory: 70,
      network: {
        upload: 200,
        download: 400,
      },
    },
    triggerDelay: 15000,
    duration: 50000,
    resolved: false,
  },
];

export class SimulationSystem {
  private static scenarios: SimulationScenario[] = [...defaultScenarios];
  private static activeScenario: SimulationScenario | null = null;
  private static simulationInterval: NodeJS.Timeout | null = null;
  private static scenarioTimeout: NodeJS.Timeout | null = null;

  // 启动模拟系统
  static startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // 每30秒检查一次是否触发新场景
    this.simulationInterval = setInterval(() => {
      this.checkAndTriggerScenario();
    }, 30000);

    // 立即触发一次初始场景
    this.checkAndTriggerScenario();
  }

  // 停止模拟系统
  static stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.scenarioTimeout) {
      clearTimeout(this.scenarioTimeout);
      this.scenarioTimeout = null;
    }

    this.activeScenario = null;
  }

  // 检查并触发场景
  private static checkAndTriggerScenario() {
    if (this.activeScenario && !this.activeScenario.resolved) {
      return; // 已有活动场景
    }

    // 随机选择场景
    const scenario = this.selectRandomScenario();
    if (scenario) {
      this.triggerScenario(scenario);
    }
  }

  // 随机选择场景
  private static selectRandomScenario(): SimulationScenario | null {
    const weightedScenarios = this.scenarios.flatMap(scenario => {
      const copies = Math.floor(scenario.probability / 5); // 每5%概率生成一个副本
      return Array(copies).fill({ ...scenario, id: uuidv4() });
    });

    if (weightedScenarios.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * weightedScenarios.length);
    return weightedScenarios[randomIndex];
  }

  // 触发场景
  private static async triggerScenario(scenario: SimulationScenario) {
    this.activeScenario = scenario;
    this.activeScenario.startTime = new Date();

    // 更新系统状态
    const systemStore = useSystemStore.getState();
    const aiStore = useAIStore.getState();

    // 添加系统通知
    systemStore.addNotification({
      title: `场景触发: ${scenario.name}`,
      message: scenario.description,
      type: scenario.type === 'emergency' ? 'error' : scenario.type === 'warning' ? 'warning' : 'info',
    });

    // 延迟后应用系统影响
    setTimeout(() => {
      // 更新系统状态
      systemStore.updateStatus({
        cpu: scenario.systemImpact.cpu,
        memory: {
          ...systemStore.status.memory,
          used: (scenario.systemImpact.memory / 100) * systemStore.status.memory.total,
          free: systemStore.status.memory.total - (scenario.systemImpact.memory / 100) * systemStore.status.memory.total,
          percentage: scenario.systemImpact.memory,
        },
        network: scenario.systemImpact.network,
      });

      // 生成AI决策
      MOSSDecisionEngine.analyze({
        context: `场景触发: ${scenario.name}`,
        data: {
          cpu: scenario.systemImpact.cpu,
          memory: scenario.systemImpact.memory,
          riskScore: scenario.type === 'emergency' ? 90 : scenario.type === 'warning' ? 75 : 40,
          riskType: scenario.type === 'emergency' ? 'resource_exhaustion' : scenario.type === 'warning' ? 'high_load' : 'normal',
        },
      });

      // 添加MOSS消息
      aiStore.addMessage({
        type: scenario.type === 'emergency' ? 'warning' : 'info',
        content: `检测到${scenario.name}，正在分析系统状态...`,
      });

    }, scenario.triggerDelay);

    // 场景结束
    this.scenarioTimeout = setTimeout(() => {
      this.resolveScenario();
    }, scenario.triggerDelay + scenario.duration);
  }

  // 解决场景
  private static resolveScenario() {
    if (this.activeScenario) {
      this.activeScenario.resolved = true;
      this.activeScenario.endTime = new Date();

      const systemStore = useSystemStore.getState();
      const aiStore = useAIStore.getState();

      // 恢复正常系统状态
      systemStore.updateStatus({
        cpu: 30,
        memory: {
          ...systemStore.status.memory,
          used: (30 / 100) * systemStore.status.memory.total,
          free: systemStore.status.memory.total - (30 / 100) * systemStore.status.memory.total,
          percentage: 30,
        },
        network: {
          upload: 100,
          download: 200,
        },
      });

      // 添加系统通知
      systemStore.addNotification({
        title: `场景结束: ${this.activeScenario.name}`,
        message: '系统已恢复正常状态',
        type: 'success',
      });

      // 添加MOSS消息
      aiStore.addMessage({
        type: 'success',
        content: `${this.activeScenario.name}已解决，系统状态已恢复正常。`,
      });

      this.activeScenario = null;
    }
  }

  // 获取当前活动场景
  static getActiveScenario(): SimulationScenario | null {
    return this.activeScenario;
  }

  // 获取所有场景
  static getScenarios(): SimulationScenario[] {
    return this.scenarios;
  }

  // 手动触发场景
  static triggerManualScenario(type: ScenarioType) {
    const scenario = this.scenarios.find(s => s.type === type);
    if (scenario) {
      this.triggerScenario({ ...scenario, id: uuidv4() });
    }
  }
}
