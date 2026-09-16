import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleDebateApi } from '../src/server/apiMiddleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const handled = await handleDebateApi(req, res);
    if (!handled && !res.writableEnded) {
      res.status(404).json({ error: 'Debate API endpoint not found' });
    }
  } catch (err: any) {
    console.error('API Handler error:', err);
    if (!res.writableEnded) {
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  }
}
