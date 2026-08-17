const BASE = 'https://api.coingecko.com/api/v3';
const KEY = import.meta.env.VITE_COINGECKO_KEY;

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}x_cg_demo_api_key=${KEY}`);
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

export async function getCoins() {
  return get('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d');
}

export async function getGlobal() {
  const json = await get('/global');
  return json.data;
}

export async function getTrending() {
  const json = await get('/search/trending');
  return json.coins;
}

export async function getSearchCoins() {
  return get('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1');
}

let marketsCache = null;
function getMarketsList() {
  if (!marketsCache) marketsCache = getSearchCoins();
  return marketsCache;
}

export async function getCoinBySymbol(sym) {
  const list = await getMarketsList();
  const s = sym.toLowerCase();
  return list.find((c) => c.symbol.toLowerCase() === s) || null;
}

export async function getCoinOHLC(id, days = 7) {
  const raw = await get(`/coins/${id}/ohlc?vs_currency=usd&days=${days}`);
  return raw.map((k) => ({ time: k[0] / 1000, open: k[1], high: k[2], low: k[3], close: k[4] }));
}

