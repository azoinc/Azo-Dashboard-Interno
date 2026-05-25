const subdomain = () => process.env.SIENGE_SUBDOMAIN || '';
const username = () => process.env.SIENGE_USERNAME || '';
const password = () => process.env.SIENGE_PASSWORD || '';

export const isConfigured = () => !!(subdomain() && username());

const baseUrl = () => `https://api.sienge.com.br/${subdomain()}/api/v1`;

const headers = () => ({
  Authorization: `Basic ${Buffer.from(`${username()}:${password()}`).toString('base64')}`,
  'Content-Type': 'application/json',
});

export async function siengeGet(path: string, params?: Record<string, string>): Promise<any> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${baseUrl()}/${path}${qs}`, { headers: headers() });
  if (!res.ok) throw new Error(`Sienge ${path} → ${res.status}`);
  return res.json();
}
