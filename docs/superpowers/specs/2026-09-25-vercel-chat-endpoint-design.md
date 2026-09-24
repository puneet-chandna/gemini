# Gemini chat endpoint design

## Goal

Keep the existing chat experience while moving the Google API key out of the browser build. The public demo must reject malformed requests and have a documented Vercel rate limit before production use.

## Current flow and selected approach

`Context.jsx` calls `runChat` in `src/config/gemini.js`. That file constructs the Google client in the browser, and `vite.config.js` injects `REACT_APP_MY_API_KEY` into the bundle. Replace that boundary with a same-origin `POST /api/chat` request. A Vercel function at `api/chat.js` owns the Google call. Migrate the legacy `@google/generative-ai` package to Google's maintained `@google/genai` SDK, as requested in the repository-wide dependency update. This uses the user's existing Vercel project, with no separate server or database.

## API contract

- Request: `POST /api/chat`, JSON body `{ "prompt": "..." }`.
- Accept a nonempty string after trimming, at most 8,000 characters. Reject unsupported methods, non-JSON bodies, and invalid prompts before calling Google. Bound request body size in the function as well.
- Success: HTTP 200, JSON `{ "text": "..." }`.
- Failure: a suitable 4xx/5xx status and a short generic JSON error. Never include the API key or upstream error details in the response or logs.
- Preserve model `gemini-2.5-flash` and generation settings: temperature 1, topP 0.95, topK 64, maxOutputTokens 8192, plain text response.
- The browser helper retains its `runChat(prompt) -> text` interface. It shows a specific short message for HTTP 429 and a generic error for other failures.

## Secrets and abuse controls

The function reads only server-side `GEMINI_API_KEY`. Remove Vite's key injection; no client variable should carry a Google key. Set the secret in the existing Vercel project, and rotate the old key if it was ever deployed in a browser bundle.

Before the public endpoint is used, configure one Vercel Firewall rate-limit rule for `POST /api/chat`: five requests per client IP per 60 seconds, returning HTTP 429. This native rule is configured in the Vercel project dashboard; repository code cannot enforce that distributed limit reliably. It is per region and can affect users sharing an IP. Google's project quota or a project spend cap is the cost backstop. The app's input limit reduces oversized requests but is not a substitute for the firewall rule.

## Deployment and verification

Document `GEMINI_API_KEY`, Vercel project setup, the firewall rule, and local `vercel dev` use in README. The existing plain `vite` command can render the UI but cannot serve `/api/chat` by itself.

Run one handler check for method/body validation and successful response shape with a mocked Google call; run lint and production build; scan the built assets for a sentinel key to verify no client leak. Update direct dependencies, lockfile, and declared runtime to current supported versions, then resolve any build or lint breakage. After deployment, confirm a normal chat succeeds, repeated POSTs from one IP receive 429, and rejected calls do not invoke the function. The live Vercel check requires project access and is separate from local verification.

## Scope

No user accounts, stored chat history, new database, or custom rate-limit store are added. Existing local chat state and UI remain in place.
