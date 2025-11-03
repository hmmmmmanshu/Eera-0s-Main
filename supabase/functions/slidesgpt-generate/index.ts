// Supabase Edge Function to proxy SlidesGPT API and avoid CORS issues
// Deploy: supabase functions deploy slidesgpt-generate
// Set secret: supabase secrets set SLIDESGPT_API_KEY=your_key

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://eera-0s-main.vercel.app',
  'https://www.eera-os.com',
];

const SLIDESGPT_API_BASE = 'https://api.slidesgpt.com/v1';

function corsHeaders(origin: string | null) {
  // Allow specific origins or all if in development
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  // Handle preflight OPTIONS request - must return 200 OK
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  try {
    const apiKey = Deno.env.get('SLIDESGPT_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ message: 'SlidesGPT API key not configured' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, theme = 'professional', slides = 10 } = body || {};
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ message: 'prompt is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const upstream = await fetch(`${SLIDESGPT_API_BASE}/presentations/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt, theme, slides }),
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';

    return new Response(text, {
      status: upstream.status,
      headers: { ...headers, 'Content-Type': contentType },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Proxy error', error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});


