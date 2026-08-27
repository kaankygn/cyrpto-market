// Ham hesaplama yardımcıları
function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function std(a) { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); }
function sma(values, period) {
    if (values.length < period) return null;
    return mean(values.slice(-period));
}
function rsi(closes, period = 14) {
    if (closes.length < period + 1) return null;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const d = closes[i] - closes[i - 1];
        if (d >= 0) gains += d; else losses -= d;
    }
    const avgGain = gains / period, avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    return 100 - 100 / (1 + avgGain / avgLoss);
}

// Ana motor: mum dizisi -> yapılandırılmış analiz
export function analyzeCandles(candles) {
    if (!candles || candles.length < 5) return null;
    const closes = candles.map((c) => c.close);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const vols = candles.map((c) => c.volume);
    const hasVol = vols.every((v) => typeof v === 'number' && !isNaN(v));

    const price = closes[closes.length - 1];
    const changePct = ((price - closes[0]) / closes[0]) * 100;

    // Getiriler (oynaklık + anomali için)
    const rets = [];
    for (let i = 1; i < closes.length; i++) rets.push(((closes[i] - closes[i - 1]) / closes[i - 1]) * 100);
    const volatility = std(rets);
    const lastRet = rets[rets.length - 1];
    const retZ = volatility ? (lastRet - mean(rets)) / volatility : 0;

    const hi = Math.max(...highs), lo = Math.min(...lows);
    const pos = hi > lo ? (price - lo) / (hi - lo) : 0.5;

    const sma20 = sma(closes, Math.min(20, closes.length));
    const rsiVal = rsi(closes, Math.min(14, closes.length - 1));

    let volume = null;
    if (hasVol) {
        const avg = mean(vols), last = vols[vols.length - 1];
        volume = { last, avg, ratio: avg ? last / avg : 1 };
    }

    // Trend
    const trend = changePct > 1.5 ? 'up' : changePct < -1.5 ? 'down' : 'sideways';

    // Açıklanabilir gösterge satırları
    const signals = [
        {
            label: 'Trend', value: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
            note: trend === 'up' ? 'Uptrend' : trend === 'down' ? 'Downtrend' : 'Sideways',
            tone: trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral'
        },
        {
            label: 'Volatility', value: `${volatility.toFixed(2)}%/bar`,
            note: volatility > 3 ? 'High' : volatility < 1 ? 'Low' : 'Moderate', tone: 'neutral'
        },
        {
            label: 'Range position', value: `${(pos * 100).toFixed(0)}%`,
            note: pos > 0.85 ? 'Near high (resistance)' : pos < 0.15 ? 'Near low (support)' : 'Mid-range', tone: 'neutral'
        },
    ];
    if (rsiVal != null) signals.splice(1, 0, {
        label: 'RSI', value: rsiVal.toFixed(0),
        note: rsiVal >= 70 ? 'Overbought' : rsiVal <= 30 ? 'Oversold' : 'Neutral',
        tone: rsiVal >= 70 ? 'down' : rsiVal <= 30 ? 'up' : 'neutral',
    });
    if (volume) signals.push({
        label: 'Volume', value: `${volume.ratio.toFixed(2)}× avg`,
        note: volume.ratio > 2 ? 'Spike — unusual' : volume.ratio < 0.5 ? 'Quiet' : 'Normal',
        tone: volume.ratio > 2 ? 'up' : 'neutral',
    });

    // Anomaliler (açıklamalı)
    const anomalies = [];
    if (Math.abs(retZ) >= 2)
        anomalies.push(`Latest bar (${lastRet >= 0 ? '+' : ''}${lastRet.toFixed(2)}%) is ${Math.abs(retZ).toFixed(1)}σ vs its recent range — an unusually large ${lastRet >= 0 ? 'up' : 'down'} move.`);
    if (volume && volume.ratio >= 2.5)
        anomalies.push(`Volume is ${volume.ratio.toFixed(1)}× the average — a notable activity spike.`);
    if (rsiVal != null && rsiVal >= 75) anomalies.push(`RSI ${rsiVal.toFixed(0)} is deep in overbought territory.`);
    if (rsiVal != null && rsiVal <= 25) anomalies.push(`RSI ${rsiVal.toFixed(0)} is deep in oversold territory.`);

    // Şeffaf eğilim skoru
    let score = 0;
    score += trend === 'up' ? 1 : trend === 'down' ? -1 : 0;
    if (rsiVal != null) score += rsiVal >= 70 ? -0.5 : rsiVal <= 30 ? 0.5 : 0;
    if (sma20) score += price > sma20 ? 0.5 : -0.5;
    score += pos > 0.85 ? -0.3 : pos < 0.15 ? 0.3 : 0;
    const bias = score > 0.5 ? 'bullish' : score < -0.5 ? 'bearish' : 'neutral';
    const confidence = Math.min(1, Math.abs(score) / 2.3);

    return {
        price, changePct, trend, rsi: rsiVal, volatility, retZ, pos, sma20, volume, signals, anomalies, bias, score, confidence,
        from: candles[0].time, to: candles[candles.length - 1].time, bars: candles.length
    };
}