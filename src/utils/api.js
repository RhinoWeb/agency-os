/** POST JSON to an API endpoint with standard error handling */
export async function apiPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
  return d;
}

/** GET from an API endpoint, returns null on failure */
export async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}
