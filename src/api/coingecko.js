const BASE = 'https://api.coingecko.com/api/v3';
const KEY = import.meta.env.VITE_COINGECKO_KEY;

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}x_cg_demo_api_key=${KEY}`);
  if (!res.ok) throw new Error('CoinGecko verisi alınamadı');
  return res.json();
}

export async function getCoins() {
  return get('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1');
}

export async function getGlobal() {
  const json = await get('/global');
  return json.data;
}

export async function getTrending() {
  const json = await get('/search/trending');
  return json.coins;
}