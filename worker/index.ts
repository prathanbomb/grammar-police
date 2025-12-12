import { correctGrammar } from './geminiService';
import { Tone, Dialect } from '../types';

interface Env {
  GEMINI_API_KEY: string;
  RATE_LIMIT: KVNamespace;
}

interface CorrectionRequest {
  text: string;
  tone: Tone;
  dialect: Dialect;
}

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60; // seconds

async function checkRateLimit(ip: string, kv: KVNamespace): Promise<boolean> {
  const key = `rate:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= RATE_LIMIT_MAX) {
    return false;
  }

  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return true;
}

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
         'unknown';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only handle /api/correct endpoint
    if (url.pathname === '/api/correct' && request.method === 'POST') {
      // Check rate limit
      const clientIP = getClientIP(request);
      const allowed = await checkRateLimit(clientIP, env.RATE_LIMIT);

      if (!allowed) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      try {
        const body = await request.json() as CorrectionRequest;

        // Validate request
        if (!body.text || !body.tone || !body.dialect) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: text, tone, dialect' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        // Call Gemini API
        const result = await correctGrammar(
          body.text,
          body.tone,
          body.dialect,
          env.GEMINI_API_KEY
        );

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error processing request:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process grammar correction' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // For all other requests, return 404 (static assets handled by Cloudflare)
    return new Response('Not Found', { status: 404 });
  }
};
