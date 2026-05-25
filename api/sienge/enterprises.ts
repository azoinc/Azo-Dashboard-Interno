import { siengeGet, isConfigured } from '../_lib/sienge';

export default async function handler(req: any, res: any) {
  if (!isConfigured()) return res.status(200).json([]);
  try {
    const data = await siengeGet('enterprises');
    res.status(200).json(data.results || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
