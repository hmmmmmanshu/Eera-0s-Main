// Supabase Edge Function to proxy VEO 3 API and avoid CORS issues
// Deploy: supabase functions deploy veo3-generate-video
// Set secret: supabase secrets set GEMINI_API_KEY=your_key

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://eera-0s-main.vercel.app',
  'https://www.eera-os.com',
];

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  // Log all requests for debugging
  console.log(`[VEO3] ${req.method} request received from origin: ${origin}`);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[VEO3] OPTIONS request - returning CORS headers');
    return new Response('', {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  try {
    console.log('[VEO3] Processing request, method:', req.method);
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[VEO3] GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false,
        message: 'GEMINI_API_KEY not configured. Please set it in Supabase Dashboard → Edge Functions → Settings → Secrets' 
      }), {
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
    const { prompt, modelName = 'veo-3.0-generate' } = body || {};
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ message: 'prompt is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Initiate video generation (returns an operation)
    // Note: VEO3 API endpoint format may vary - trying standard format first
    console.log(`[VEO3] Calling VEO3 API with model: ${modelName}`);
    console.log(`[VEO3] Prompt length: ${prompt.length} characters`);
    
    const generateResponse = await fetch(
      `${GEMINI_API_BASE}/models/${modelName}:generateVideos?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('[VEO3] API Error:', {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        error: errorText,
      });
      
      // Try to parse error for better message
      let errorMessage = 'VEO3 API error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText.substring(0, 200); // Limit error text length
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        message: 'VEO3 API error', 
        error: errorMessage,
        status: generateResponse.status,
        details: 'Check if VEO3 model is available and API key has correct permissions'
      }), {
        status: generateResponse.status >= 400 && generateResponse.status < 500 ? generateResponse.status : 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const operationData = await generateResponse.json();
    console.log('[VEO3] Operation created:', operationData);

    // Step 2: Poll for operation completion
    const operationName = operationData.name;
    if (!operationName) {
      return new Response(JSON.stringify({ message: 'No operation name returned' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Poll the operation until it's done
    let operation = operationData;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (poll every 5 seconds)

    while (!operation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `${GEMINI_API_BASE}/${operationName}?key=${apiKey}`
      );

      if (!statusResponse.ok) {
        return new Response(JSON.stringify({ 
          message: 'Failed to check operation status',
          status: statusResponse.status 
        }), {
          status: statusResponse.status,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      operation = await statusResponse.json();
      attempts++;

      console.log(`[VEO3] Polling operation (attempt ${attempts}/${maxAttempts}):`, {
        done: operation.done,
      });
    }

    if (!operation.done) {
      return new Response(JSON.stringify({ message: 'Video generation timed out' }), {
        status: 504,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Extract video file reference and download
    const videoFile = operation.result?.generated_videos?.[0]?.video;
    if (!videoFile) {
      return new Response(JSON.stringify({ 
        message: 'No video data in operation result',
        operation: operation 
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const fileUri = videoFile.uri || videoFile.name || videoFile;
    let videoBlob: Blob;

    if (typeof fileUri === 'string' && fileUri.startsWith('http')) {
      // Direct URL
      const videoResponse = await fetch(fileUri);
      videoBlob = await videoResponse.blob();
    } else {
      // File ID - download via files API
      const fileId = typeof fileUri === 'string' ? fileUri.split('/').pop() : fileUri;
      const downloadResponse = await fetch(
        `${GEMINI_API_BASE}/files/${fileId}:download?key=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!downloadResponse.ok) {
        return new Response(JSON.stringify({ 
          message: 'Failed to download video file',
          status: downloadResponse.status 
        }), {
          status: downloadResponse.status,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      videoBlob = await downloadResponse.blob();
    }

    // Convert blob to base64 for transmission
    const arrayBuffer = await videoBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(JSON.stringify({
      success: true,
      video: {
        data: base64,
        mimeType: 'video/mp4',
        size: videoBlob.size,
      },
      operation: {
        name: operationName,
        attempts: attempts,
      },
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[VEO3] Unexpected error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Proxy error', 
      error: errorMessage,
      stack: errorStack,
      details: 'Check Edge Function logs for more details'
    }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});

