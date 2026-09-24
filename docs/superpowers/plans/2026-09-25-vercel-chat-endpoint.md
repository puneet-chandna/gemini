# Vercel Chat Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the existing chat UI while moving Gemini requests and the API key to a validated, rate-limited Vercel function.

**Architecture:** `src/config/gemini.js` keeps the `runChat(prompt) -> text` browser interface and calls same-origin `POST /api/chat`. The Vercel Node function alone reads `GEMINI_API_KEY` and calls Google's maintained `@google/genai` SDK. Vercel Firewall supplies the distributed IP rate limit; no application-side store is added.

**Tech Stack:** React 19, Vite 8, Vercel Node.js 24 Functions, `@google/genai` 2, ESLint 9, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-25-vercel-chat-endpoint-design.md`

## Global Constraints

- Browser request: `POST /api/chat` with JSON `{ "prompt": "..." }`; success is HTTP 200 JSON `{ "text": "..." }`.
- Accept a nonempty trimmed string of at most 8,000 characters. Reject unsupported methods, non-JSON or malformed bodies, and invalid prompts before any Google call. Cap the function request body at 64 KiB, enough for an 8,000-character JSON prompt even when escaped.
- Return short generic JSON errors with suitable 4xx/5xx codes; never expose the API key or upstream error details in responses or logs.
- Preserve `gemini-2.5-flash`, temperature `1`, `topP` `0.95`, `topK` `64`, `maxOutputTokens` `8192`, and `responseMimeType` `text/plain`.
- Keep `runChat(prompt) -> text`; show a specific short HTTP 429 message and a generic message for other failures. Keep local chat state and UI behavior.
- Only the function reads server-side `GEMINI_API_KEY`. Remove Vite's `REACT_APP_MY_API_KEY` injection and the legacy `@google/generative-ai` package.
- Before public use, configure Vercel Firewall for `POST /api/chat`: five requests per client IP per 60 seconds, action HTTP 429. Record its per-region/shared-IP limitations and use a Google project quota or spend cap as the cost backstop.
- Use Node.js `24.x` on Vercel and in `package.json`. Upgrade direct dependencies to supported stable majors: React 19, Vite 8 with plugin-react 6, `@google/genai` 2, and ESLint 9. ESLint 10 is excluded because the current `eslint-plugin-react` 7 peer range ends at ESLint 9.7+.
- Local UI-only `vite` cannot serve `/api/chat`; use `vercel dev` for end-to-end local chat. No new database, account system, chat persistence, or custom rate-limit store.

## Review Focus

- `Content-Type: application/json; charset=utf-8` should be accepted; Task 2 tests it.
- Malformed JSON should produce 400 without invoking Google; Task 2 tests it.
- A body over 64 KiB without a `Content-Length` header should produce 413 before parsing or invoking Google; Task 2 tests it.
- An 8,000-character Unicode prompt should pass while 8,001 characters should fail; Task 2 tests both boundaries.
- An upstream exception or empty upstream text should produce a generic 502 without echoing provider details; Task 2 tests both.

## File map

- `package.json`, `package-lock.json`: declare Node 24, supported direct dependencies, and `node --test`/flat-config lint scripts.
- `eslint.config.js` (new), `.eslintrc.cjs` (delete): migrate existing React, Hooks, and Refresh lint rules to ESLint 9 flat config.
- `api/chat.js` (new): validate method, content type, streamed body size, JSON, and prompt; call Google with preserved settings; return JSON without leaking errors.
- `test/chat.test.js` (new): exercise the function using Node `Request`/`Response` and an injected fake Google call.
- `src/config/gemini.js`: keep the browser helper signature while replacing the browser SDK call with `fetch('/api/chat')`.
- `test/gemini.test.js` (new): exercise success, HTTP 429, other HTTP failures, and invalid responses using a fake `fetch`.
- `src/context/Context.jsx`: display the safe rate-limit message while retaining the existing chat flow.
- `vite.config.js`: remove `loadEnv` and the key-valued `define` entry.
- `README.md`, `.gitignore`: document setup, deployment controls, real behavior, and ignore Vercel local metadata.

---

### Task 1: Upgrade the supported frontend toolchain

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `eslint.config.js`
- Delete: `.eslintrc.cjs`
- Test: existing `npm run lint` and `npm run build`

**Interfaces:**
- Consumes: existing React UI and `vite.config.js` without changing its API yet.
- Produces: Node 24 declaration, React 19/Vite 8 build, ESLint 9 flat config, and a lockfile usable by `npm ci`.

- [ ] **Step 1: Record the current baseline.**

Run: `npm ci && npm run lint && npm run build`

Expected: record each command's exit code and any pre-existing failure. Use a disposable environment; do not insert a real key.

- [ ] **Step 2: Upgrade compatible majors and establish the red lint check.**

Run:

```bash
npm pkg set 'engines.node=24.x' 'scripts.lint=eslint . --max-warnings 0' 'scripts.test=node --test'
npm install 'react@^19' 'react-dom@^19'
npm install -D 'vite@^8' '@vitejs/plugin-react@^6' 'eslint@^9' '@eslint/js@^9' 'globals@^17' 'eslint-plugin-react@^7' 'eslint-plugin-react-hooks@^7' 'eslint-plugin-react-refresh@^0.5' '@types/react@^19' '@types/react-dom@^19'
npm run lint
```

Expected: the last command fails because ESLint 9 expects a flat config and the repo still has `.eslintrc.cjs`. Do not use `--force` or `--legacy-peer-deps` to hide an incompatible package.

- [ ] **Step 3: Replace the legacy lint config.** Delete `.eslintrc.cjs` and create `eslint.config.js`:

```js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      'react/jsx-no-target-blank': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];
```

- [ ] **Step 4: Verify a clean install, lint, and build.**

Run: `npm ci && npm run lint && npm run build && npm ls --depth=0`

Expected: every command passes; lockfile and manifest agree. If a new major flags actual UI code, fix only the reported incompatibility and repeat these commands.

- [ ] **Step 5: Commit the independently working toolchain update.**

```bash
git add package.json package-lock.json eslint.config.js .eslintrc.cjs
git diff --cached --check
git commit -m "chore: update Gemini frontend toolchain"
```

### Task 2: Move chat generation to a validated server function

**Files:**
- Create: `api/chat.js`, `test/chat.test.js`, `test/gemini.test.js`
- Modify: `package.json`, `package-lock.json`, `src/config/gemini.js`, `src/context/Context.jsx`, `vite.config.js`
- Test: `test/chat.test.js`, `test/gemini.test.js`

**Interfaces:**
- Consumes: Node 24, Vercel Web `Request`/`Response`, and the existing `runChat(prompt) -> text` call in `Context.jsx`.
- Produces: named `handleChat(request, generateText?) -> Promise<Response>` for tests, Vercel default `fetch` export for `/api/chat`, and browser `runChat(prompt) -> Promise<string>` plus `RATE_LIMIT_MESSAGE`.

- [ ] **Step 1: Add the server handler tests before the implementation.** Create `test/chat.test.js`:

```js
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
  for (const generate of [async () => { throw new Error('private provider detail'); }, async () => '']) {
    const response = await handleChat(post({ prompt: 'hi' }), generate);
    assert.equal(response.status, 502);
    assert.equal(JSON.stringify(await response.json()).includes('private provider detail'), false);
  }
});
```

- [ ] **Step 2: Run the server tests red.**

Run: `node --test test/chat.test.js`

Expected: FAIL because `api/chat.js` does not exist.

- [ ] **Step 3: Install the maintained SDK and implement `api/chat.js`.**

Run:

```bash
npm install '@google/genai@^2'
```

Create `api/chat.js`:

```js
import { GoogleGenAI } from '@google/genai';

const MAX_BODY_BYTES = 64 * 1024;

const json = (value, status, headers = {}) => Response.json(value, {
  status,
  headers: { 'Cache-Control': 'no-store', ...headers },
});

async function generateText(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing server configuration');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
  return response.text;
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
  } catch {
    return json({ error: 'Chat unavailable' }, 502);
  }
}

export default { fetch: handleChat };
```

- [ ] **Step 4: Run the server tests green.**

Run: `node --test test/chat.test.js`

Expected: five tests PASS, including the five Review Focus conditions.

- [ ] **Step 5: Add browser-helper tests before replacing the old helper.** Create `test/gemini.test.js`:

```js
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
```

- [ ] **Step 6: Run the browser-helper tests red.**

Run: `node --test test/gemini.test.js`

Expected: FAIL because the current helper imports the browser Google SDK and does not export `RATE_LIMIT_MESSAGE`.

- [ ] **Step 7: Replace browser SDK use and remove key injection.** Replace `src/config/gemini.js` with:

```js
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
```

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
```

In `src/context/Context.jsx`, import `RATE_LIMIT_MESSAGE` alongside `runChat`, then replace its catch block with:

```jsx
} catch (error) {
  setResultData(error?.message === RATE_LIMIT_MESSAGE
    ? RATE_LIMIT_MESSAGE
    : 'Error: Could not fetch response');
} finally {
```

Remove the now unused packages:

```bash
npm uninstall @google/generative-ai dotenv express
```

- [ ] **Step 8: Verify both paths and commit.**

Run: `npm test && npm run lint && npm run build && npm ls --depth=0`

Expected: tests, lint, build, and dependency tree pass. The browser bundle must not import `@google/genai` or contain a key.

```bash
git add api/chat.js test/chat.test.js test/gemini.test.js src/config/gemini.js src/context/Context.jsx vite.config.js package.json package-lock.json
git diff --cached --check
git commit -m "feat: proxy Gemini chat through Vercel function"
```

### Task 3: Document deployment controls and verify the artifact

**Files:**
- Modify: `README.md`, `.gitignore`
- Test: built `dist/` and a local `vercel dev` request

**Interfaces:**
- Consumes: working `/api/chat` function, `runChat` browser helper, and the existing Vercel project.
- Produces: a reproducible setup and an explicit gate for the external Firewall, secret, and cost controls.

- [ ] **Step 1: Write deployment instructions that match the code.** Replace the README Quick Start and stale project-structure/key instructions with this content, keeping the existing feature overview where accurate:

```markdown
## Run locally

Requires Node.js 24 and a Gemini API key. Clone `https://github.com/puneet-chandna/gemini.git`, then run `npm ci`. Link the existing Vercel project with `npx vercel link`, set the server-side `GEMINI_API_KEY` in its Development environment, and run `npx vercel dev`. The plain `npm run dev` Vite server renders the UI but cannot answer `/api/chat`.

## Public deployment checklist

1. In the existing Vercel project, select Node.js 24 and set `GEMINI_API_KEY` for the environments that will run this function. Do not prefix it with `VITE_` or `REACT_APP_`.
2. Before enabling public use, add a Vercel Firewall rate-limit rule matching path `/api/chat` and method `POST`: five requests per client IP per 60 seconds, with HTTP 429 for excess requests. The limit is per region and users behind one IP may share it.
3. Set a Gemini project quota or spend cap. If a key was ever shipped in a browser build, rotate it before deployment.
4. Deploy, send one normal chat request, then send more than five requests from one IP within 60 seconds. Confirm the excess request gets 429 and does not invoke the function.

The chat has local in-memory session state; responses appear word by word after the full response arrives. No conversation history is stored on a server.
```

Add `.vercel/` to `.gitignore`. Remove the stale `REACT_APP_MY_API_KEY` example, the `yourusername` clone URL, and the claim of true response streaming. Do not put a sample real key in the README.

- [ ] **Step 2: Scan a production build using fake sentinel values.**

Run:

```bash
REACT_APP_MY_API_KEY=PUBLIC_SENTINEL_SHOULD_NOT_APPEAR GEMINI_API_KEY=PRIVATE_SENTINEL_SHOULD_NOT_APPEAR npm run build
rg -F 'PUBLIC_SENTINEL_SHOULD_NOT_APPEAR' dist; test "$?" -eq 1
rg -F 'PRIVATE_SENTINEL_SHOULD_NOT_APPEAR' dist; test "$?" -eq 1
rg 'REACT_APP_MY_API_KEY|@google/generative-ai' src vite.config.js package.json; test "$?" -eq 1
npm test && npm run lint
```

Expected: both sentinel searches and the legacy import search return no matches; tests and lint pass. Do not print or scan a real key.

- [ ] **Step 3: Smoke the local API without a real provider request.**

Run `npx vercel dev` with the linked Development environment in one terminal, then in another run:

```bash
curl -i -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' --data '{"prompt":"   "}'
curl -i -X POST http://localhost:3000/api/chat -H 'Content-Type: text/plain' --data 'hi'
```

Expected: 400 and 415 JSON responses, respectively, with no Google request. Do not put a key in these commands.

- [ ] **Step 4: Commit the documentation and final local checks.**

```bash
git add README.md .gitignore
git diff --cached --check
git commit -m "docs: explain Gemini deployment controls"
git status --short
```

Expected: clean working tree. A separate owner-access deployment check must set `GEMINI_API_KEY`, configure the Firewall and quota, and verify one successful chat plus HTTP 429 before declaring the public deployment complete.

## Source notes

- Google SDK migration and Node `generateContent` configuration: https://ai.google.dev/gemini-api/docs/migrate and https://ai.google.dev/api/generate-content
- Vercel Node function `fetch` export and environment setup: https://vercel.com/docs/functions/runtimes/node-js and https://vercel.com/docs/environment-variables
- Vercel's native body ceiling is 4.5 MB; this plan adds an application cap of 64 KiB: https://vercel.com/docs/functions/limitations
- Vite 8/React plugin 6 and Node support: https://vite.dev/blog/announcing-vite8
- ESLint 10 removes `.eslintrc`, while current `eslint-plugin-react` 7 declares peers only through ESLint 9.7+: https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ and https://github.com/jsx-eslint/eslint-plugin-react
