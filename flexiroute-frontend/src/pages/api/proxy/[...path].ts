import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:8000/api';

function buildTargetUrl(req: NextApiRequest): string {
  const pathParam = req.query.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else if (typeof value === 'string') {
      searchParams.append(key, value);
    }
  }

  const query = searchParams.toString();
  const base = BACKEND_BASE_URL.replace(/\/+$/, '');
  const target = `${base}/${path}`;

  return query ? `${target}?${query}` : target;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const targetUrl = buildTargetUrl(req);
  const method = req.method || 'GET';

  const headers: Record<string, string> = {};
  if (typeof req.headers.authorization === 'string') {
    headers.authorization = req.headers.authorization;
  }
  if (typeof req.headers['content-type'] === 'string') {
    headers['content-type'] = req.headers['content-type'];
  }

  const hasBody = !['GET', 'HEAD'].includes(method);

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = await response.text();

    res.status(response.status);
    if (contentType) {
      res.setHeader('content-type', contentType);
    }
    res.send(payload);
  } catch {
    res.status(502).json({ error: 'Backend is unavailable' });
  }
}
