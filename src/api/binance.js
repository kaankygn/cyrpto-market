const BINANCE = 'https://api.binance.com/api/v3';

export async function getKlines(symbol, interval = '1h', limit = 200) {
  const url = `${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load chart data');
  const raw = await res.json();
  return raw.map((k) => ({
    time: k[0] / 1000,
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));
}