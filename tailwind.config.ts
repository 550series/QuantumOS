import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MOSS 主色调
        moss: {
          blue: '#0A0E17',      // 深空蓝 - 背景主色
          cyan: '#00F0FF',      // 极光青 - 核心强调色
          white: '#E8F4F8',     // 星光白 - 文字/边框
        },
        // 功能色
        cyber: {
          orange: '#FF6B35',    // 能量橙 - 警告/重要操作
          red: '#FF2E63',       // 等离子红 - 错误/紧急警报
          green: '#00FF88',     // 量子绿 - 成功/正常状态
          purple: '#7B2CBF',    // 深空紫 - 信息提示
        },
        // 背景色系
        dark: {
          900: '#0A0E17',
          800: '#0F1420',
          700: '#151C2C',
          600: '#1A2332',
          500: '#1F2937',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-strong': '0 0 40px rgba(0, 240, 255, 0.8)',
        'neon-orange': '0 0 30px rgba(255, 107, 53, 0.6)',
        'neon-red': '0 0 30px rgba(255, 46, 99, 0.6)',
        'neon-green': '0 0 30px rgba(0, 255, 136, 0.6)',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00F0FF, #7B2CBF)',
        'energy-gradient': 'linear-gradient(180deg, #00F0FF, #00FF88)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5', boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '100%': { opacity: '1', boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
