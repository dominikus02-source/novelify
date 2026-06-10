// AI utility that works both locally (via z-ai-web-dev-sdk with .z-ai-config)
// and on Vercel (via environment variables ZAI_BASE_URL and ZAI_API_KEY)

let zaiInstance: any = null;

async function getZAI() {
  if (zaiInstance) return zaiInstance;

  const baseUrl = process.env.ZAI_BASE_URL;
  const apiKey = process.env.ZAI_API_KEY;

  if (baseUrl && apiKey) {
    zaiInstance = { baseUrl, apiKey };
    return zaiInstance;
  }

  // Fall back to SDK for local development
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  zaiInstance = await ZAI.create();
  return zaiInstance;
}

export async function createChatCompletion(messages: { role: string; content: string }[]) {
  const zai = await getZAI();

  if (zai.baseUrl && zai.apiKey) {
    // Direct fetch for serverless (Vercel)
    const response = await fetch(`${zai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zai.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'deepseek-chat',
        messages,
        thinking: { type: 'disabled' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // SDK path (local)
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });

  return completion.choices[0]?.message?.content || '';
}
