const BASE = 'https://api.coingecko.com/api/v3';

export async function getCoins() {
  const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Coin verisi alınamadı');
  return res.json();
}