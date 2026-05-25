import { siengeGet, isConfigured } from '../_lib/sienge';

export default async function handler(req: any, res: any) {
  if (!isConfigured()) return res.status(200).json([]);

  const startDate = req.query?.startDate || req.query?.start_date;
  const endDate = req.query?.endDate || req.query?.end_date;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate e endDate obrigatórios' });

  try {
    const data = await siengeGet('bills', { paymentDateStart: startDate, paymentDateEnd: endDate });
    res.status(200).json(data.results || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
