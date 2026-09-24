import test from 'node:test';
import assert from 'node:assert/strict';
import { handleChat } from '../api/chat.js';

const url = 'http://localhost/api/chat';
const post = (body, contentType = 'application/json') => new Request(url, {
  method: 'POST',
  headers: { 'content-type': contentType },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('valid JSON and charset preserve the text contract', async () => {
  const prompts = [];
  const response = await handleChat(post({ prompt: '  hi  ' }, 'application/json; charset=utf-8'), async prompt => {
    prompts.push(prompt);
    return 'hello';
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { text: 'hello' });
  assert.deepEqual(prompts, ['hi']);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('method, content type, and malformed JSON are rejected before Google', async () => {
  let calls = 0;
  const generate = async () => { calls++; return 'unused'; };
  assert.equal((await handleChat(new Request(url), generate)).status, 405);
  assert.equal((await handleChat(post({ prompt: 'hi' }, 'text/plain'), generate)).status, 415);
  assert.equal((await handleChat(post('{broken'), generate)).status, 400);
  assert.equal(calls, 0);
});

test('blank, non-string, and over-limit prompts are rejected', async () => {
  let calls = 0;
  const generate = async () => { calls++; return 'unused'; };
  for (const prompt of ['   ', 7, '🙂'.repeat(8001)]) {
    assert.equal((await handleChat(post({ prompt }), generate)).status, 400);
  }
  assert.equal((await handleChat(post({ prompt: '🙂'.repeat(8000) }), generate)).status, 200);
  assert.equal(calls, 1);
});

test('an oversized streamed body receives 413 without Google', async () => {
  let calls = 0;
  const response = await handleChat(post({ prompt: 'x'.repeat(65_536) }), async () => { calls++; return 'unused'; });
  assert.equal(response.status, 413);
  assert.equal(calls, 0);
});

test('provider failures and empty output reveal no upstream detail', async () => {
  const logs = [];
  const originalError = console.error;
  console.error = (...args) => logs.push(args);
  try {
    for (const generate of [async () => { throw Object.assign(new Error('private provider detail'), { status: 403 }); }, async () => '']) {
      const response = await handleChat(post({ prompt: 'hi' }), generate);
      assert.equal(response.status, 502);
      assert.equal(JSON.stringify(await response.json()).includes('private provider detail'), false);
    }
  } finally {
    console.error = originalError;
  }
  assert.equal(logs.length, 2);
  assert.equal(logs[0][1].status, 403);
  assert.equal(JSON.stringify(logs).includes('private provider detail'), false);
});
