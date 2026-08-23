/**
 * issue #48：基于 Web Audio API 的合成音效引擎。
 * 所有声音遵守全局 soundEnabled 开关，可通过 setSoundEnabled 同步状态。
 */

let audioContext: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (value) {
    mm.ensureContext();
  }
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioContext = new AC();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => undefined);
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0
): void {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  } catch {
    // 音频异常静默忽略，不影响主流程
  }
}

const mm = {
  ensureContext,
  setEnabled: setSoundEnabled,
  click(): void {
    playTone(600, 0.06, 'square', 0.04);
  },
  openWindow(): void {
    playTone(392, 0.1, 'triangle', 0.07);
  },
  closeWindow(): void {
    playTone(262, 0.1, 'triangle', 0.06);
  },
  notification(): void {
    playTone(523.25, 0.12, 'sine', 0.13);
    playTone(659.25, 0.12, 'sine', 0.11, 0.1);
  },
  warning(): void {
    playTone(330, 0.18, 'sawtooth', 0.12, 0);
    playTone(440, 0.18, 'sawtooth', 0.1, 0.12);
  },
  alert(): void {
    playTone(440, 0.2, 'sawtooth', 0.15);
    playTone(660, 0.2, 'sawtooth', 0.13, 0.18);
  },
};

export const SoundManager = mm;