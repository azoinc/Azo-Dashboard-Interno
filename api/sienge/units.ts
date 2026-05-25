const subdomain = process.env.SIENGE_SUBDOMAIN || '';
const username = process.env.SIENGE_USERNAME || '';
const password = process.env.SIENGE_PASSWORD || '';
const base = `https://api.sienge.com.br/${subdomain}/api/v1`;
const auth = () => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export default async function handler(req: any, res: any) {
  if (!subdomain || !username) return res.status(200).json({ total: 0, disponiveis: 0, vgvEstoque: 0 });

  const enterpriseId = req.query?.enterpriseId;
  if (!enterpriseId) return res.status(400).json({ error: 'enterpriseId obrigatório' });

  try {
    const r = await fetch(`${base}/enterprises/${enterpriseId}/units`, { headers: { Authorization: auth() } });
    if (!r.ok) throw new Error(`Sienge ${r.status}`);
    const data = await r.json();
    const units = data.results || [];

    const disponiveisUnits = units.filter((u: any) => {
      const status = String(u.status || '').toUpperCase();
      return status !== 'VENDIDA' && status !== 'SOLD' && !status.includes('VENDID');
    });

    const vgvEstoque = disponiveisUnits.reduce((acc: number, u: any) => {
      const val = u.vgv || u.basePrice || u.price || u.salePrice || u.suggestedPrice ||
        u.contractValue || u.value || (u.prices?.[0]?.value) || 0;
      return acc + Number(val);
    }, 0);

    res.status(200).json({
      total: data.metadata?.total || units.length,
      disponiveis: disponiveisUnits.length,
      vgvEstoque,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
