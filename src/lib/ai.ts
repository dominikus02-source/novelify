const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com';
const apiKey = process.env.AI_API_KEY;
const model = process.env.AI_MODEL || 'deepseek-chat';

export async function createChatCompletion(messages: { role: string; content: string }[]) {
  if (!apiKey) {
    throw new Error('AI_API_KEY environment variable is not set');
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI API request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
