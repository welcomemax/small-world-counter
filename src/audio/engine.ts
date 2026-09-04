export type Cue =
  | 'opening'
  | 'handover'
  | 'newRound'
  | 'complete'
  | 'die'
  | 'dieBlank'
  | 'die1'
  | 'die2'
  | 'die3'
  | 'shuffle'
  | 'first'
  | 'deal'

export function cueForDieFace(face: 0 | 1 | 2 | 3): Cue {
  if (face === 0) return 'dieBlank'
  if (face === 1) return 'die1'
  if (face === 2) return 'die2'
  return 'die3'
}

export type AudioGraph = {
  ctx: AudioContext
}

type Tone = {
  freq: number
  at: number
  dur: number
  gain?: number
  type?: OscillatorType
}

function defaultOpen(): AudioGraph | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  try {
    return { ctx: new Ctor() }
  } catch {
    return null
  }
}

function tone(ctx: AudioContext, spec: Tone): void {
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = spec.type ?? 'triangle'
  osc.frequency.value = spec.freq
  const start = ctx.currentTime + spec.at
  const peak = spec.gain ?? 0.08
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(peak, start + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + spec.dur)
  osc.connect(amp).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + spec.dur + 0.02)
}

function noiseBurst(ctx: AudioContext, at: number, dur: number): void {
  const sampleRate = ctx.sampleRate || 44100
  const length = Math.max(1, Math.floor(sampleRate * dur))
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const amp = ctx.createGain()
  src.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = 1800
  const start = ctx.currentTime + at
  amp.gain.setValueAtTime(0.05, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filter).connect(amp).connect(ctx.destination)
  src.start(start)
  src.stop(start + dur)
}

export class SoundEngine {
  private graph: AudioGraph | null = null
  private readonly openGraph: () => AudioGraph | null

  constructor(openGraph: () => AudioGraph | null = defaultOpen) {
    this.openGraph = openGraph
  }

  play(cue: Cue): void {
    const graph = this.ensure()
    if (!graph) return
    const { ctx } = graph
    if (cue === 'die') {
      noiseBurst(ctx, 0, 0.22)
      tone(ctx, { freq: 220, at: 0, dur: 0.12, gain: 0.04, type: 'square' })
      return
    }
    if (cue === 'dieBlank') {
      noiseBurst(ctx, 0, 0.16)
      tone(ctx, { freq: 110, at: 0, dur: 0.22, gain: 0.05, type: 'sine' })
      return
    }
    if (cue === 'die1') {
      tone(ctx, { freq: 330, at: 0, dur: 0.22, gain: 0.1 })
      return
    }
    if (cue === 'die2') {
      tone(ctx, { freq: 330, at: 0, dur: 0.14 })
      tone(ctx, { freq: 440, at: 0.1, dur: 0.22, gain: 0.1 })
      return
    }
    if (cue === 'die3') {
      tone(ctx, { freq: 330, at: 0, dur: 0.12 })
      tone(ctx, { freq: 440, at: 0.1, dur: 0.12 })
      tone(ctx, { freq: 554, at: 0.2, dur: 0.28, gain: 0.11 })
      return
    }
    if (cue === 'shuffle') {
      noiseBurst(ctx, 0, 0.2)
      tone(ctx, { freq: 392, at: 0, dur: 0.08, gain: 0.05 })
      tone(ctx, { freq: 294, at: 0.07, dur: 0.08, gain: 0.05 })
      tone(ctx, { freq: 349, at: 0.14, dur: 0.1, gain: 0.05 })
      return
    }
    if (cue === 'first') {
      tone(ctx, { freq: 392, at: 0, dur: 0.16 })
      tone(ctx, { freq: 523, at: 0.12, dur: 0.32, gain: 0.1 })
      return
    }
    if (cue === 'deal') {
      tone(ctx, { freq: 523, at: 0, dur: 0.07, gain: 0.06, type: 'square' })
      tone(ctx, { freq: 392, at: 0.05, dur: 0.1, gain: 0.05, type: 'triangle' })
      return
    }
    if (cue === 'complete') {
      tone(ctx, { freq: 392, at: 0, dur: 0.4, type: 'sine' })
      tone(ctx, { freq: 494, at: 0, dur: 0.4, type: 'sine' })
      tone(ctx, { freq: 587, at: 0.08, dur: 0.55, type: 'sine', gain: 0.09 })
      return
    }
    if (cue === 'opening') {
      tone(ctx, { freq: 262, at: 0, dur: 0.22 })
      tone(ctx, { freq: 330, at: 0.12, dur: 0.24 })
      tone(ctx, { freq: 392, at: 0.26, dur: 0.38, gain: 0.1 })
      return
    }
    if (cue === 'newRound') {
      tone(ctx, { freq: 392, at: 0, dur: 0.16 })
      tone(ctx, { freq: 494, at: 0.1, dur: 0.16 })
      tone(ctx, { freq: 587, at: 0.22, dur: 0.32, gain: 0.1 })
      return
    }
    tone(ctx, { freq: 330, at: 0, dur: 0.16 })
    tone(ctx, { freq: 440, at: 0.11, dur: 0.28, gain: 0.09 })
  }

  private ensure(): AudioGraph | null {
    if (this.graph?.ctx.state === 'closed') this.graph = null
    if (!this.graph) this.graph = this.openGraph()
    const ctx = this.graph?.ctx
    if (ctx?.state === 'suspended') void ctx.resume()
    return this.graph
  }
}

export const soundEngine = new SoundEngine()
