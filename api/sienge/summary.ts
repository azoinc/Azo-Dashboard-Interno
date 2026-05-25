export default async function handler(req: any, res: any) {
  const subdomain = process.env.SIENGE_SUBDOMAIN || '';
  const username = process.env.SIENGE_USERNAME || '';
  const password = process.env.SIENGE_PASSWORD || '';

  if (!subdomain || !username) {
    return res.status(200).json({ vendas: 0, vgv: 0, estoque: 0, vgvEstoque: 0, custos: [] });
  }

  const startDate = req.query?.startDate || req.query?.start_date;
  const endDate = req.query?.endDate || req.query?.end_date;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
  }

  const base = `https://api.sienge.com.br/${subdomain}/api/v1`;
  const creds = Buffer.from(`${username}:${password}`).toString('base64');
  const headers = { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' };

  const get = async (url: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const resp = await fetch(`${url}${qs}`, { headers });
    if (!resp.ok) throw new Error(`Sienge API error: ${resp.status} ${url}`);
    return resp.json();
  };

  try {
    const [enterprisesData, vendasData, custosData] = await Promise.all([
      get(`${base}/enterprises`),
      get(`${base}/commercial-contracts`, { startDate, endDate }),
      get(`${base}/bills`, { paymentDateStart: startDate, paymentDateEnd: endDate }),
    ]);

    const enterprises = enterprisesData.results || [];
    const estoques = await Promise.all(enterprises.map((emp: any) => get(`${base}/enterprises/${emp.id}/units`)));

    let totalDisp = 0, totalVgvEst = 0;
    for (const estData of estoques) {
      const units = estData.results || [];
      const avail = units.filter((u: any) => !String(u.status || '').toUpperCase().includes('VENDID'));
      totalDisp += avail.length;
      totalVgvEst += avail.reduce((acc: number, u: any) => {
        for (const k of ['vgv','basePrice','price','salePrice','suggestedPrice','contractValue','value']) {
          if (u[k]) return acc + Number(u[k]);
        }
        return acc;
      }, 0);
    }

    const results = vendasData.results || [];
    const vgv = results.reduce((acc: number, r: any) => acc + Number(r.contractValue || 0), 0);

    res.status(200).json({
      vendas: results.length, vgv,
      estoque: totalDisp, vgvEstoque: totalVgvEst,
      custos: custosData.results || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
