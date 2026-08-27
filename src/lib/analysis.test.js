import { describe, it, expect } from 'vitest'
import { analyzeCandles } from './analysis'

// Kapanış (ve opsiyonel hacim) dizisinden mum üret
function candles(closes, volumes) {
  return closes.map((c, i) => ({
    time: 1_700_000_000 + i * 3600,
    open: i === 0 ? c : closes[i - 1],
    high: c * 1.001,
    low: c * 0.999,
    close: c,
    volume: volumes ? volumes[i] : 100,
  }))
}

describe('analyzeCandles', () => {
  it('5 mumdan az veride null döner', () => {
    expect(analyzeCandles(candles([1, 2, 3]))).toBeNull()
  })

  it('yükseliş trendini ve bullish eğilimi yakalar', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i * 2)
    const r = analyzeCandles(candles(closes))
    expect(r).not.toBeNull()
    expect(r.trend).toBe('up')
    expect(r.changePct).toBeGreaterThan(0)
    expect(r.bias).toBe('bullish')
    expect(r.bars).toBe(30)
  })

  it('düşüş trendini yakalar', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 - i * 2)
    const r = analyzeCandles(candles(closes))
    expect(r.trend).toBe('down')
    expect(r.changePct).toBeLessThan(0)
  })

  it('hacim patlamasını anomali olarak işaretler', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i))
    const vols = Array(30).fill(100)
    vols[29] = 500 // son mum ~5x
    const r = analyzeCandles(candles(closes, vols))
    expect(r.volume.ratio).toBeGreaterThan(2)
    expect(r.anomalies.some((a) => a.toLowerCase().includes('volume'))).toBe(true)
  })

  it('RSI 0-100, range position 0-1 aralığında', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i)
    const r = analyzeCandles(candles(closes))
    expect(r.rsi).toBeGreaterThanOrEqual(0)
    expect(r.rsi).toBeLessThanOrEqual(100)
    expect(r.pos).toBeGreaterThanOrEqual(0)
    expect(r.pos).toBeLessThanOrEqual(1)
  })
})
