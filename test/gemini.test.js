import test from 'node:test';
import assert from 'node:assert/strict';
import runChat, { RATE_LIMIT_MESSAGE } from '../src/config/gemini.js';

test('runChat posts the prompt and returns text', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/chat');
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), { prompt: 'hello' });
      return Response.json({ text: 'answer' });
    };
    assert.equal(await runChat('hello'), 'answer');
  } finally { globalThis.fetch = original; }
});

test('runChat uses a specific 429 message and generic other errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('blocked', { status: 429 });
    await assert.rejects(runChat('hi'), { message: RATE_LIMIT_MESSAGE });
    globalThis.fetch = async () => Response.json({ error: 'private provider detail' }, { status: 502 });
    await assert.rejects(runChat('hi'), { message: 'Could not fetch response' });
    globalThis.fetch = async () => Response.json({ unexpected: true });
    await assert.rejects(runChat('hi'), { message: 'Could not fetch response' });
  } finally { globalThis.fetch = original; }
});
