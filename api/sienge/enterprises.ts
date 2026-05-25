const subdomain = process.env.SIENGE_SUBDOMAIN || '';
const username = process.env.SIENGE_USERNAME || '';
const password = process.env.SIENGE_PASSWORD || '';
const base = `https://api.sienge.com.br/${subdomain}/api/v1`;
const auth = () => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export default async function handler(req: any, res: any) {
  if (!subdomain || !username) return res.status(200).json([]);
  try {
    const r = await fetch(`${base}/enterprises`, { headers: { Authorization: auth() } });
    if (!r.ok) throw new Error(`Sienge ${r.status}`);
    const data = await r.json();
    res.status(200).json(data.results || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
