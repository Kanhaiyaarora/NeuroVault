## 📌 Feature coverage check vs Problem_Statement/PRD/plan/backend_prd

### Implemented
- Auth + content CRUD + owner security (exists)
- Browser extension ingest route (`/ingest`)
- PDF import route (`/import`)
- Graph endpoint (`/graph`)
- Resurface endpoint (`/resurface`)
- Semantic pipeline:
  - Langchain text split
  - Mistral embeddings + summary
  - Pinecone vector upsert
- Async background job queue (in-process) + retry
- Manual enrich trigger (`/:id/enrich`)
- Full-text search route + filters + tags
- Detection of duplicates by normalizedUrl/fileHash
- Basic content model fields + indices as spec

### Partial / missing from docs
- file+image storage actual ImageKit upload flow (only metadata now)
- OCR path (tesseract) for images not integrated yet in controller
- YouTube transcript ingestion not yet in route/service
- Full AI tag-suggestion / topic-clustering / “related item suggestion” endpoint explicit
- Semantic search path (`search?semantic=true`) currently returns 501 placeholder
- Chat/RAG API path not yet in place (per backend_prd)
- Paid queue system (BullMQ/Redis) not implemented; in-process only
- Resurfacing advanced scoring (only simple date/tags)
- client-side (frontend + extension code) not in this backend scope

---

## 🛠️ Next step-by-step plan to complete remaining PRD features

1. **Semantic search + RAG**
   - implement `src/controllers/search.controller.js`
   - `GET /api/content/search?semantic=true`
   - embed query + `vector.service.querySimilarVectors`
   - return ranked contents + metadata

2. **Image upload + OCR**
   - route `POST /api/content/import-image` + multer
   - OCR via `tesseract.js` from buffer
   - create content type image + textChunks from OCR
   - enqueue enrichment

3. **YouTube + tweet ingestion**
   - service: `youtube-transcript` + oEmbed fetch
   - service: tweet scrapper / metadata
   - create content item + requires vectorization

4. **ImageKit / file persistence**
   - add `src/config/imagekit.js` + env settings
   - store returned `fileStorageId`, `image` URL
   - implement delete cleanup in `deleteContent`

5. **Semantic query feature**
   - turn 501 into real endpoint
   - optional: `POST /api/content/query` for RAG (context + model)
   - + related item suggestions (graph edges using vector similarity + tags)

6. **Queue persistence + worker**
   - migrate in-process queue into BullMQ with Redis
   - add worker script `src/workers/enrich.worker.js`

7. **Health / status**
   - add `GET /api/content/:id/status`:
     - `vectorReady`, `lastUpdated`, `enrichmentInQueue`
   - optionally compute `resurfaceScore`

8. **Tests**
   - unit + integration with Jest/Supertest for:
     - create/update + queue entry
     - /import PDF
     - /:id/enrich
     - /graph & /resurface

9. **Frontend + extension sync**
   - map API endpoints to extension POST calls
   - show queue status (pending/ready) in UI

---

## 🧷 Quick action item (if you want it now)

- Implement `semantic` search and `seed graph`:
  - add to `content.controller.searchContent`:
    - if `semantic=true`: call query vectors, hydrate Mongo, return score
- Add `resurface` policy "not touched for 30 days + low view count" (future)
- Add `vectorReady` response in list and item details.

---

## 🔍 Validation upon next request

I can run one command for you:
- `npm run dev` + test request sequence:
  - `POST /api/content`  
  - verify `content.vectorReady=false`, then `true` (after queue)
  - `POST /api/content/:id/enrich`
  - `POST /api/content/import` (PDF)
  - `GET /api/content/search?semantic=true` now from TODO.

---

If you prefer, I can implement the `semantic=true` search and `related suggestion` route immediately next.