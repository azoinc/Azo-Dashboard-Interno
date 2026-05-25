const subdomain = process.env.SIENGE_SUBDOMAIN || '';
const username = process.env.SIENGE_USERNAME || '';
const password = process.env.SIENGE_PASSWORD || '';
const base = `https://api.sienge.com.br/${subdomain}/api/v1`;
const auth = () => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export default async function handler(req: any, res: any) {
  if (!subdomain || !username) return res.status(200).json([]);
  const startDate = req.query?.startDate || req.query?.start_date;
  const endDate = req.query?.endDate || req.query?.end_date;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate e endDate obrigatórios' });
  try {
    const r = await fetch(`${base}/bills?paymentDateStart=${startDate}&paymentDateEnd=${endDate}`, { headers: { Authorization: auth() } });
    if (!r.ok) throw new Error(`Sienge ${r.status}`);
    const data = await r.json();
    res.status(200).json(data.results || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
