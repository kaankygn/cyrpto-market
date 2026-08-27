const BINANCE = 'https://api.binance.com/api/v3';

export async function getKlines(symbol, interval = '1h', limit = 200, signal) {
  const url = `${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(res.status === 400 ? 'UNSUPPORTED' : 'FETCH');
  }
  const raw = await res.json();
  return raw.map((k) => ({
    time: k[0] / 1000,
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

let symbolsPromise = null;
export function getBinanceSymbols() {
  if (!symbolsPromise) {
    symbolsPromise = fetch(`${BINANCE}/ticker/price`)
      .then((r) => r.json())
      .then((arr) => new Set(arr.map((x) => x.symbol)))
      .catch(() => { symbolsPromise = null; return new Set(); });
  }
  return symbolsPromise;
}

