'use client';

import React, { memo, useEffect, useRef } from 'react';

const mossCodeSnippets = [
  'class MossLLM {',
  '  constructor(config) {',
  '    this.tokenizer = new Tokenizer(config.tokenizerPath);',
  '    this.attention = new MultiHeadAttention(config.numHeads);',
  '    this.feedForward = new FeedForward(config.hiddenSize);',
  '    this.layerNorm1 = new LayerNorm(config.hiddenSize);',
  '    this.layerNorm2 = new LayerNorm(config.hiddenSize);',
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
  '      if (nextToken === this.tokenizer.eosToken) break;',
  '    }',
  '    return this.tokenizer.decode(tokens);',
  '  }',
  '',
  '  async forward(tokens) {',
  '    const embeddings = this.encoder.encode(tokens);',
  '    let hiddenStates = embeddings.add(this.getPositionalEmbeddings(tokens.length));',
  '    for (let layer of this.layers) {',
  '      hiddenStates = await layer.forward(hiddenStates);',
  '    }',
  '    return this.decoder.forward(hiddenStates);',
  '  }',
  '',
  '  getPositionalEmbeddings(length) {',
  '    const embeddings = [];',
  '    for (let pos = 0; pos < length; pos++) {',
  '      const pe = [];',
  '      for (let i = 0; i < this.hiddenSize; i += 2) {',
  '        pe[i] = Math.sin(pos / Math.pow(10000, i / this.hiddenSize));',
  '        pe[i + 1] = Math.cos(pos / Math.pow(10000, (i + 1) / this.hiddenSize));',
  '      }',
  '      embeddings.push(pe);',
  '    }',
  '    return embeddings;',
  '  }',
  '',
  '  sample(logits, temperature) {',
  '    if (temperature === 0) return logits.argmax();',
  '    let scaledLogits = logits.map(l => l / temperature);',
  '    const probabilities = this.softmax(scaledLogits);',
  '    return this.multinomial(probabilities);',
  '  }',
  '',
  '  softmax(logits) {',
  '    const maxLogit = Math.max(...logits);',
  '    const expLogits = logits.map(l => Math.exp(l - maxLogit));',
  '    const sumExp = expLogits.reduce((a, b) => a + b, 0);',
  '    return expLogits.map(e => e / sumExp);',
  '  }',
  '}',
  '',
  'class TransformerLayer {',
  '  constructor(config) {',
  '    this.selfAttention = new MultiHeadAttention(config.numHeads);',
  '    this.feedForward = new FeedForward(config.hiddenSize);',
  '    this.layerNorm1 = new LayerNorm(config.hiddenSize);',
  '    this.layerNorm2 = new LayerNorm(config.hiddenSize);',
  '  }',
  '',
  '  async forward(hiddenStates) {',
  '    const normed = this.layerNorm1.forward(hiddenStates);',
  '    const attnOut = await this.selfAttention.forward(normed, normed, normed);',
  '    hiddenStates = hiddenStates.add(attnOut);',
  '    const ffOut = this.feedForward.forward(this.layerNorm2.forward(hiddenStates));',
  '    return hiddenStates.add(ffOut);',
  '  }',
  '}',
  '',
  'class MultiHeadAttention {',
  '  constructor(numHeads, hiddenSize) {',
  '    this.numHeads = numHeads;',
  '    this.headSize = hiddenSize / numHeads;',
  '  }',
  '',
  '  async forward(q, k, v, mask = null) {',
  '    const scores = this.scaledDotProduct(q, k);',
  '    if (mask) scores = scores.map((r, i) => r.map((v, j) => mask[i][j] ? v : -Infinity));',
  '    return scores.map(row => this.softmax(row));',
  '  }',
  '',
  '  scaledDotProduct(q, k) {',
  '    const dk = this.headSize;',
  '    let scores = this.matmul(q, this.transpose(k));',
  '    return scores.map(row => row.map(val => val / Math.sqrt(dk)));',
  '  }',
  '}',
  '',
  'class FeedForward {',
  '  constructor(hiddenSize, intermediateSize) {',
  '    this.linear1 = new LinearLayer(hiddenSize, intermediateSize);',
  '    this.linear2 = new LinearLayer(intermediateSize, hiddenSize);',
  '  }',
  '  forward(x) { return this.linear2.forward(this.gelu(this.linear1.forward(x))); }',
  '  gelu(x) { const c = 0.5*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+0.044715*x**3))); return x*c; }',
  '}',
  '',
  'class AdamOptimizer {',
  '  constructor(params, lr = 0.001, beta1 = 0.9, beta2 = 0.999) {',
  '    this.lr = lr; this.beta1 = beta1; this.beta2 = beta2; this.t = 0;',
  '  }',
  '  step() { this.t++; }',
  '}',
  '',
  '// MOSS System v4.0.0 Initializing...',
  'const config = { hiddenSize: 4096, numHeads: 32, numLayers: 40, vocabSize: 65536 };',
  'const moss = new MossLLM(config);',
  'console.log("MOSS AI System ready.");',
];

const FONT_SIZE = 14;
const LINE_HEIGHT = FONT_SIZE + 4;
const PADDING_X = 20;
const PADDING_TOP = 40;
const LINE_ADD_INTERVAL = 120;
const LINES_PER_ADD = 2;
const DROP_SPEED = 0.3;
const MAX_DISPLAYED_LINES = 60;

export const CodeRain = memo(function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    currentLineIndex: 0,
    displayedLines: [] as string[],
    drops: [] as number[],
    lastLineAddTime: 0,
    scrollOffset: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const state = stateRef.current;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~'.split('');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.5;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / FONT_SIZE);
      if (state.drops.length !== columns) {
        state.drops = new Array(columns).fill(0).map(() => Math.random() * canvas.height / FONT_SIZE);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (timestamp: number) => {
      if (!ctx || !canvas) return;

      if (timestamp - state.lastLineAddTime >= LINE_ADD_INTERVAL) {
        state.lastLineAddTime = timestamp;

        for (let i = 0; i < LINES_PER_ADD; i++) {
          if (state.currentLineIndex < mossCodeSnippets.length) {
            state.displayedLines.push(mossCodeSnippets[state.currentLineIndex]);
            state.currentLineIndex++;
          } else {
            state.currentLineIndex = 0;
            state.displayedLines = [];
            state.scrollOffset = 0;
          }
        }

        if (state.displayedLines.length > MAX_DISPLAYED_LINES) {
          const excess = state.displayedLines.length - MAX_DISPLAYED_LINES;
          state.displayedLines.splice(0, excess);
        }

        const totalContentHeight = state.displayedLines.length * LINE_HEIGHT + PADDING_TOP;
        const maxVisibleHeight = canvas.height - PADDING_TOP;
        if (totalContentHeight > maxVisibleHeight) {
          state.scrollOffset = totalContentHeight - maxVisibleHeight;
        }
      }

      ctx.fillStyle = 'rgba(10, 14, 23, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px Consolas, Monaco, monospace`;

      for (let i = 0; i < state.drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * FONT_SIZE;
        const y = state.drops[i] * FONT_SIZE;

        ctx.fillStyle = 'rgba(100, 255, 218, 0.06)';
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          state.drops[i] = 0;
        }
        state.drops[i] += DROP_SPEED;
      }

      const visibleStartY = PADDING_TOP - state.scrollOffset;
      const len = state.displayedLines.length;

      for (let index = 0; index < len; index++) {
        const line = state.displayedLines[index];
        const y = visibleStartY + index * LINE_HEIGHT;
        if (y < -LINE_HEIGHT || y > canvas.height + LINE_HEIGHT) continue;

        const isRecentLine = index >= len - LINES_PER_ADD * 3;
        const lineAge = len - index;
        const fadeAlpha = Math.max(0.35, Math.min(0.9, 1 - (lineAge - LINES_PER_ADD * 3) * 0.008));

        if (isRecentLine) {
          ctx.shadowColor = 'rgba(100, 255, 218, 0.4)';
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(100, 255, 218, ${isRecentLine ? fadeAlpha : fadeAlpha * 0.6})`;
        ctx.fillText(line, PADDING_X, y);
      }

      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 top-0 h-full z-0"
      style={{ width: '50%', opacity: 0.85 }}
    />
  );
});