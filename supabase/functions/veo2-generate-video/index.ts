// Supabase Edge Function for VEO 2 video generation
// Deploy: supabase functions deploy veo2-generate-video
// Set secret: supabase secrets set GEMINI_API_KEY=your_key
// Reference: https://developers.googleblog.com/en/veo-2-video-generation-now-generally-available/

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
  console.log(`[VEO2] ${req.method} request received from origin: ${origin}`);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[VEO2] OPTIONS request - returning CORS headers');
    return new Response('', {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  try {
    console.log('[VEO2] Processing request, method:', req.method);
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[VEO2] GEMINI_API_KEY not configured');
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
    const { prompt, modelName = 'veo-2.0-generate-001', aspectRatio = '16:9', durationSeconds = 5 } = body || {};
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ message: 'prompt is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Initiate video generation using VEO 2
    // VEO 2 uses generateContent endpoint with responseModalities: ["video"]
    console.log(`[VEO2] Calling VEO2 API with model: ${modelName}`);
    console.log(`[VEO2] Prompt length: ${prompt.length} characters`);
    console.log(`[VEO2] Aspect ratio: ${aspectRatio}, Duration: ${durationSeconds}s`);
    
    // Map aspect ratio to dimension format
    // VEO 2 supports: 16:9 (W1280H720), 9:16 (W1080H1920), 1:1 (W1024H1024)
    let dimension: string;
    if (aspectRatio === '9:16') {
      dimension = 'W1080H1920'; // Vertical/Portrait
    } else if (aspectRatio === '1:1') {
      dimension = 'W1024H1024'; // Square
    } else {
      dimension = 'W1280H720'; // Horizontal/Landscape (16:9)
    }
    
    // Clamp duration to VEO 2 supported values (5-8 seconds)
    const finalDuration = Math.min(Math.max(Math.round(durationSeconds), 5), 8);
    
    // VEO 2 uses generateContent endpoint with video response modality
    const generateResponse = await fetch(
      `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['video'],
            videoConfig: {
              durationSeconds: finalDuration,
              dimension: dimension,
            }
          }
        }),
      }
    );

    const responseText = await generateResponse.text();
    console.log('[VEO2] API Response Status:', generateResponse.status);
    console.log('[VEO2] API Response Body:', responseText.substring(0, 500)); // Log first 500 chars

    if (!generateResponse.ok) {
      console.error('[VEO2] API Error:', {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        error: responseText,
        endpoint: `${GEMINI_API_BASE}/models/${modelName}:generateContent`,
        requestBody: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['video'],
            videoConfig: {
              durationSeconds: finalDuration,
              dimension: dimension,
            }
          }
        }),
      });
      
      // Try to parse error for better message
      let errorMessage = 'VEO2 API error';
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        errorMessage = responseText.substring(0, 500); // Show more error text
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        message: 'VEO2 API error', 
        error: errorMessage,
        details: errorDetails,
        status: generateResponse.status,
        endpoint: `${GEMINI_API_BASE}/models/${modelName}:generateContent`,
        suggestion: 'VEO 2 video generation may require Python SDK or different endpoint. Check: https://developers.googleblog.com/en/veo-2-video-generation-now-generally-available/'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[VEO2] Parsed response:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error('[VEO2] Failed to parse response:', e);
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Failed to parse API response',
        details: responseText.substring(0, 500)
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Extract video from response
    // Expected format: { candidates: [{ content: { parts: [{ video: { uri: "..." } }] } }] }
    const candidate = responseData.candidates?.[0];
    const videoPart = candidate?.content?.parts?.find((part: any) => part.video);
    
    if (!videoPart?.video) {
      console.error('[VEO2] No video in response:', responseData);
      return new Response(JSON.stringify({ 
        success: false,
        message: 'No video data in response',
        details: JSON.stringify(responseData, null, 2)
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const videoUri = videoPart.video.uri || videoPart.video.url;
    console.log('[VEO2] Video URI:', videoUri);

    // If it's a data URI (base64), extract and return directly
    if (videoUri.startsWith('data:')) {
      const base64Match = videoUri.match(/^data:video\/\w+;base64,(.+)$/);
      if (base64Match) {
        const base64Data = base64Match[1];
        return new Response(JSON.stringify({
          success: true,
          video: {
            data: base64Data,
            mimeType: 'video/mp4',
            size: base64Data.length,
          },
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // If it's a URL, download the video
    if (videoUri.startsWith('http')) {
      const videoResponse = await fetch(videoUri);
      if (!videoResponse.ok) {
        return new Response(JSON.stringify({ 
          success: false,
          message: 'Failed to download video from URL',
          url: videoUri,
          status: videoResponse.status
        }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const videoBlob = await videoResponse.blob();
      const arrayBuffer = await videoBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return new Response(JSON.stringify({
        success: true,
        video: {
          data: base64,
          mimeType: 'video/mp4',
          size: videoBlob.size,
        },
      }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Unknown format
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Unknown video URI format',
      uri: videoUri
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[VEO2] Unexpected error:', err);
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

