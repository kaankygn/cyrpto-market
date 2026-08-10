export async function getFearGreed() {
  const res = await fetch('https://api.alternative.me/fng/');
  if (!res.ok) throw new Error('Failed to load index');
  const json = await res.json();
  return json.data[0]; // { value, value_classification, timestamp }
}
