export const RATE_LIMIT_MESSAGE = 'Too many requests. Please try again in a minute.';

export default async function runChat(prompt) {
  let response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  } catch {
    throw new Error('Could not fetch response');
  }

  if (response.status === 429) throw new Error(RATE_LIMIT_MESSAGE);
  if (!response.ok) throw new Error('Could not fetch response');
  const data = await response.json().catch(() => null);
  if (typeof data?.text !== 'string') throw new Error('Could not fetch response');
  return data.text;
}
