import { GoogleGenAI } from '@google/genai';

const MAX_BODY_BYTES = 64 * 1024;

const json = (value, status, headers = {}) => Response.json(value, {
  status,
  headers: { 'Cache-Control': 'no-store', ...headers },
});

async function generateText(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing server configuration');
  let stage = 'construct';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    stage = 'generateContent';
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      },
    });
    stage = 'responseText';
    return response.text;
  } catch (error) {
    if (error && typeof error === 'object') error.chatStage = stage;
    throw error;
  }
}

export async function handleChat(request, generate = generateText) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return json({ error: 'JSON required' }, 415);
  }

  let payload;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request.body ?? []) {
      size += chunk.byteLength;
      if (size > MAX_BODY_BYTES) return json({ error: 'Request too large' }, 413);
      chunks.push(Buffer.from(chunk));
    }
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const prompt = payload?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim() || [...prompt.trim()].length > 8000) {
    return json({ error: 'Invalid prompt' }, 400);
  }

  try {
    const text = await generate(prompt.trim());
    if (typeof text !== 'string' || !text.trim()) throw new Error('Empty response');
    return json({ text }, 200);
  } catch (error) {
    const diagnostic = {
      source: !process.env.GEMINI_API_KEY ? 'configuration' : error?.message === 'Empty response' ? 'empty_response' : 'provider',
      status: Number.isInteger(error?.status) ? error.status : null,
      name: ['Error', 'TypeError', 'ApiError'].includes(error?.name) ? error.name : 'other',
      cause: ['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].includes(error?.cause?.code) ? error.cause.code : null,
      stage: ['construct', 'generateContent', 'responseText'].includes(error?.chatStage) ? error.chatStage : null,
    };
    console.error('Gemini chat failure', diagnostic);
    return json({ error: 'Chat unavailable', diagnostic }, 502);
  }
}

export default { fetch: handleChat };
