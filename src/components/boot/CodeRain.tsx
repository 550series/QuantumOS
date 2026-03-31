'use client';

import React, { useEffect, useRef, useState } from 'react';

// MOSS相关的真实代码片段
const mossCodeSnippets = [
  'class MossLLM {',
  '  constructor(config) {',
  '    this.modelPath = config.modelPath;',
  '    this.tokenizer = new Tokenizer(config.tokenizerPath);',
  '    this.encoder = new Encoder();',
  '  }',
  '',
  '  async generate(prompt, options = {}) {',
  '    const tokens = this.tokenizer.encode(prompt);',
  '    const maxTokens = options.maxTokens || 100;',
  '    const temperature = options.temperature || 0.7;',
  '',
  '    for (let i = 0; i < maxTokens; i++) {',
  '      const logits = await this.forward(tokens);',
  '      const nextToken = this.sample(logits, temperature);',
  '      tokens.push(nextToken);',
  '',
  '      if (nextToken === this.tokenizer.eosToken) {',
  '        break;',
  '      }',
  '    }',
  '',
  '    return this.tokenizer.decode(tokens);',
  '  }',
  '',
  '  async forward(tokens) {',
  '    // 模型前向传播',
  '    const embeddings = this.encoder.encode(tokens);',
  '    const hiddenStates = await this.model(embeddings);',
  '    return hiddenStates[hiddenStates.length - 1];',
  '  }',
  '',
  '  sample(logits, temperature) {',
  '    // 采样下一个token',
  '    if (temperature === 0) {',
  '      return logits.argmax();',
  '    }',
  '',
  '    const scaledLogits = logits / temperature;',
  '    const probabilities = this.softmax(scaledLogits);',
  '    return this.multinomial(probabilities);',
  '  }',
  '}',
  '',
  'class Tokenizer {',
  '  constructor(vocabPath) {',
  '    this.vocab = this.loadVocab(vocabPath);',
  '    this.eosToken = this.vocab["<|endoftext|>"];',
  '  }',
  '',
  '  encode(text) {',
  '    // 文本编码为tokens',
  '    return text.split("").map(char => this.vocab[char] || this.vocab["<|unk|"]);',
  '  }',
  '',
  '  decode(tokens) {',
  '    // tokens解码为文本',
  '    const vocabReverse = Object.fromEntries(',
  '      Object.entries(this.vocab).map(([k, v]) => [v, k])',
  '    );',
  '    return tokens.map(token => vocabReverse[token] || "<|unk|>").join("");',
  '  }',
  '}',
  '',
  '// 初始化MOSS模型',
  'const moss = new MossLLM({',
  '  modelPath: "./models/moss-16b",',
  '  tokenizerPath: "./tokenizers/moss-tokenizer.json"',
  '});',
  '',
  '// 示例使用',
  'async function runMoss() {',
  '  const prompt = "Explain quantum computing in simple terms.";',
  '  const response = await moss.generate(prompt, {',
  '    maxTokens: 200,',
  '    temperature: 0.8',
  '  });',
  '  console.log("MOSS Response:", response);',
  '}'
];

export const CodeRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.7; // 左侧70%宽度
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 加载代码行
    const loadCodeLine = () => {
      if (currentLine < mossCodeSnippets.length) {
        setDisplayedLines(prev => [...prev, mossCodeSnippets[currentLine]]);
        setCurrentLine(prev => prev + 1);
      }
    };

    // 每2秒加载一行代码
    const lineInterval = setInterval(loadCodeLine, 2000);

    const draw = () => {
      // 半透明背景，创建拖尾效果
      ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 设置字体和颜色
      const fontSize = 14;
      ctx.font = `${fontSize}px Consolas, Monaco, monospace`;

      // 绘制已加载的代码行
      displayedLines.forEach((line, index) => {
        // 计算位置
        const x = 20;
        const y = 40 + index * (fontSize + 4);

        // 创建渐变色
        const gradient = ctx.createLinearGradient(x, y - fontSize * 5, x, y);
        gradient.addColorStop(0, 'rgba(100, 255, 218, 0)');
        gradient.addColorStop(0.5, 'rgba(100, 255, 218, 0.7)');
        gradient.addColorStop(1, 'rgba(100, 255, 218, 1)');

        ctx.fillStyle = gradient;
        ctx.fillText(line, x, y);
      });

      // 绘制矩阵风格的背景字符
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`'.split('');
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = Array(columns).fill(1);

      for (let i = 0; i < drops.length; i++) {
        // 随机选择字符
        const char = chars[Math.floor(Math.random() * chars.length)];

        // 计算位置
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // 淡色背景字符
        ctx.fillStyle = 'rgba(100, 255, 218, 0.1)';
        ctx.fillText(char, x, y);

        // 随机重置或继续下落
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const drawInterval = setInterval(draw, 50);

    return () => {
      clearInterval(drawInterval);
      clearInterval(lineInterval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [currentLine, displayedLines]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 top-0 h-full z-0"
      style={{ width: '70%', opacity: 0.8 }}
    />
  );
};
