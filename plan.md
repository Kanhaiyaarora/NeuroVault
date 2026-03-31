# Second Brain App Implementation Plan (NeuroVault)

## 1. Current base review (as of 2026-03-30)

- Backend: Express + MongoDB. ESLint not present.
- Auth: `register`, `login`, `logout`, `get-me` with JWT in HttpOnly cookie.
- User model: username, email, password + bcrypt hashing.
- Content model: robust schema with URL, tags, category, vector fields, text chunks, vector status.
- Routes:
  - `/api/auth/*` implemented.
  - `/api/content/*` route exists but empty.
- Controllers:
  - auth controller implemented.
  - content controller empty.
- Middleware: auth check by JWT cookie.
- Upload helper: memory multer.
- Dependencies present for advanced content flow (pinecone, langchain, pdf-parse, tesseract, youtube-transcript, imagekit).

## 2. Goal alignment with `Second-Brain-App` style

Target features:
- Auth / multi-user workspace
- Save notes/URLs/documents/images/Videos
- Ingest using URL scraping / PDF / image OCR / YouTube transcript
- Tagging + categorization + metadata
- Semantic vector embeddings in Pinecone
- Semantic search + filtering
- Summaries + text chunking for RAG
- Content CRUD & user ownership
- Frontend support (login, dashboard, card list, detail, search, upload)

## 3. Immediate project plan: backend first

### Phase 1: Core API + access control

1. Add `src/config/db.js` and connect MongoDB in `server.js`.
2. Implement `content.controller.js` CRUD operations:
   - `createContent` (with minimal fields)
   - `updateContent` (owner only)
   - `deleteContent` (owner only)
   - `getContentById` (owner only)
   - `listContent` with pagination, tags, category filters
3. Implement `content.routes.js`:
   - POST `/` -> create + authUser
   - GET `/` -> list + authUser
   - GET `/:id` -> fetch + authUser
   - PUT `/:id` -> update + authUser
   - DELETE `/:id` -> delete + authUser
4. Add content validation zod/express-validator with API stability.
5. Add authorship check (content.userId matches req.user.id).

### Phase 2: Data ingestion pipeline

1. Build utilities in `src/utils`:
   - normalize URL, dedup by URL hash.
   - URL metadata fetch via `open-graph-scraper`.
   - Page text extraction (simple html scraping or `node-fetch` + `cheerio`).
2. Content types ingestion:
   - link/article: fetch metadata/title/description and store `type: article`.
   - youtube: use `youtube-transcript` and metadata from oEmbed, store `type: youtube`.
   - pdf: handle file upload, parse text via `pdf-parse`, store chunks.
   - image: OCR via `tesseract.js`, store alt text candidate.
3. Global pipeline helper: `ingestContent(rawPayload)` in `services/content.service.js`.

### Phase 3: Vectorization and Pinecone

1. Add `src/config/pinecone.js` and environment variables (`PINECONE_API_KEY`, `PINECONE_ENV`, `PINECONE_INDEX`), `OPENAI_API_KEY` or LLM provider.
2. Add vector generation service in `src/services/vector.service.js`:
   - split text via `langchain/textsplitters`
   - call embedding model via langchain/your provider
   - upsert per-chunk vectors into Pinecone and store ids in `content.vectorIds`
   - set `content.vectorReady = true` and save `vectorIds`.
3. Add a webhook endpoint to revectorize content on-demand.

### Phase 4: Semantic + keyword search

1. Add API route: `GET /api/content/search?q=...` with user scope.
2. Vector search path:
   - query embedding from text
   - pinecone query with userFilter
   - fetch content IDs from results
   - hydrate full content from Mongo
3. Fallback keyword search (Mongo text index on title/description/tags/summary).
4. JSON response both as content list and relevance scores.

### Phase 5: AI summary + notes assistant

1. Add endpoint `POST /api/content/:id/summary` or within create/update.
2. Use LLM (OpenAI/Mistral) to generate 1-2 sentence summary.
3. Store in `summary` and optionally in `textChunks`.
4. Add `POST /api/conversations` (optional) for RAG QA.

### Phase 6: UX/Deployment & integration

1. Frontend skeleton (if not started): login/register, dashboard, cards, content detail, upload UI.
2. Add WebSocket/real-time updates (optional).
3. Add error handling + rate limiting + security headers.
4. Prepare `.env.example` and README instructions.
5. Test with Postman + automated tests (`jest` + `supertest`), validate core flows.
6. Deploy to Render:
   - service `backend` with env vars, node command `npm run dev` or `node server.js`.
   - CDN or static site for frontend.

## 4. Suggested `plan.md` milestones (week-by-week)

- Week 1: Auth + content CRUD + models + routes + basic testing.
- Week 2: Ingestion (URLs, PDF, YouTube, image OCR) + metadata pipeline.
- Week 3: Vector store + embeddings + search API.
- Week 4: AI summaries + RAG endpoints + frontend integration.
- Week 5: polish, security, deployment.

## 5. Developer tasks (detailed)

1. Verify full backend startup works:
   - `npm install`; create `.env` with `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=development`
   - confirm `node server.js` or `npm run dev` works.
2. Add request logging + centralized error handler.
3. Add tests for /api/auth and /api/content.
4. Add docs for API endpoints in `backend/README.md`.

## 6. Notes / optional modernizations

- Use `async/await` consistently (already done).
- Consider `passport` or JWT middleware for `Authorization` header, not cookies, if cross-domain.
- Consider `mongoose` text indexes: `contentSchema.index({ title: 'text', description: 'text', tags: 'text', summary: 'text' })`.
- Add `content.status` (`active`, `archived`, `deleted`).
- Add `spaceId` feature for multi-workspace second brain.

---

> This plan preserves your instruction: no code changes now, purely read + roadmap output.

