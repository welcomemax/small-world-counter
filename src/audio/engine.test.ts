import { describe, expect, test, vi } from 'vitest'
import { SoundEngine, type AudioGraph } from './engine'

function stubNode() {
  const node = {
    type: 'sine',
    frequency: { value: 0 },
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn((next: unknown) => next ?? node),
    start: vi.fn(),
    stop: vi.fn(),
  }
  return node
}

function fakeGraph(): AudioGraph & { oscillators: ReturnType<typeof stubNode>[] } {
  const oscillators: ReturnType<typeof stubNode>[] = []
  const ctx = {
    currentTime: 1,
    sampleRate: 44100,
    destination: {},
    state: 'running' as AudioContextState,
    resume: vi.fn(async () => {
      ctx.state = 'running'
    }),
    createOscillator: vi.fn(() => {
      const node = stubNode()
      oscillators.push(node)
      return node as unknown as OscillatorNode
    }),
    createGain: vi.fn(() => stubNode() as unknown as GainNode),
    createBuffer: vi.fn((_channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    })),
    createBufferSource: vi.fn(() => stubNode() as unknown as AudioBufferSourceNode),
    createBiquadFilter: vi.fn(() => stubNode() as unknown as BiquadFilterNode),
  }
  return { ctx: ctx as unknown as AudioContext, oscillators }
}

describe('SoundEngine', () => {
  test('plays a handover phrase', () => {
    const graph = fakeGraph()
    const engine = new SoundEngine(() => graph)
    engine.play('handover')
    expect(graph.oscillators.length).toBeGreaterThan(0)
    expect(graph.oscillators[0]!.start).toHaveBeenCalled()
  })

  test('rattles the reinforcement die', () => {
    const graph = fakeGraph()
    const engine = new SoundEngine(() => graph)
    engine.play('die')
    expect(graph.ctx.createBufferSource).toHaveBeenCalled()
    expect(graph.oscillators[0]!.start).toHaveBeenCalled()
  })

  test('resolves a finished game with a chord', () => {
    const graph = fakeGraph()
    const engine = new SoundEngine(() => graph)
    engine.play('complete')
    expect(graph.oscillators.length).toBe(3)
  })

  test('does nothing when the browser has no audio graph', () => {
    const engine = new SoundEngine(() => null)
    expect(() => engine.play('opening')).not.toThrow()
  })
})
