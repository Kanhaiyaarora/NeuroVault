# 📄 PRODUCT REQUIREMENT DOCUMENT (PRD)

## 🧠 Product: **NeuroVault**

---

# 1. 🎯 Product Overview

NeuroVault is a **dual-platform system**:

### 1. Web App (MERN)

👉 main dashboard + AI system + knowledge management

### 2. Browser Extension

👉 fast capture tool (1-click save from internet)

---

# 2. 🧩 System Architecture (High Level)

```
[ Browser Extension ]
        ↓
   (API Request)
        ↓
[ Node.js Backend ]
        ↓
 ┌───────────────┬───────────────┐
 │ MongoDB       │ Vector DB     │
 │ (metadata)    │ (embeddings)  │
 └───────────────┴───────────────┘
        ↓
[ AI Service (Mistral) ]
        ↓
[ File Storage (ImageKit) ]
        ↓
[ React Web App UI ]
```

---

# 3. 🧱 PLATFORM 1: MERN WEB APP

---

## 🟢 MODULE 1: AUTH & USER SYSTEM

### Features

* signup/login
* JWT auth
* user sessions

---

## 🟢 MODULE 2: DASHBOARD

### Views

* All items
* Collections
* Recent saves
* Resurfaced items

---

## 🟢 MODULE 3: ITEM MANAGEMENT

### Features

* view saved content
* edit title/tags
* delete item

---

## 🟢 MODULE 4: SEARCH SYSTEM

### 4.1 Basic Search

* keyword-based

### 4.2 Semantic Search

* embedding-based
* similarity ranking

---

## 🔵 MODULE 5: AI ENGINE

Using:
👉 **Mistral AI**

---

### Features

* embeddings generation
* auto tagging
* related content
* query understanding

---

## 🔵 MODULE 6: AI CHAT

### Purpose

User apni saved knowledge se interact kare

---

### Flow

```
User Query
   ↓
Embedding
   ↓
Vector DB search
   ↓
Top results (context)
   ↓
AI response
```

---

### UI Requirements

* chat interface (ChatGPT-like)
* message history
* source references

---

## 🔵 MODULE 7: VOICE NOTES

### Flow

```
Voice Input
   ↓
Speech → Text
   ↓
Save as Item
   ↓
AI Processing
```

---

## 🟣 MODULE 8: KNOWLEDGE GRAPH

* nodes = items
* edges = relationships

Use:

* **D3.js**

---

## 🟣 MODULE 9: RESURFACING SYSTEM

### Logic

* time-based
* relevance-based

### Output

* dashboard cards
* notifications

---

## 🟣 MODULE 10: HIGHLIGHTS

* text selection
* stored highlights
* searchable

---

## 🟢 MODULE 11: STORAGE INTEGRATION

### Files

👉 **ImageKit**

### Metadata

* MongoDB

---

# 4. 🌐 PLATFORM 2: BROWSER EXTENSION

---

## 🎯 Purpose

👉 frictionless capture
👉 1-click save

---

## 🟢 MODULE 1: CONTENT CAPTURE

### Supported

* article (HTML)
* YouTube (title + link)
* tweet
* PDF
* images

---

## 🟢 MODULE 2: UI (Popup)

### Components

* Save button
* Title preview
* Tag input (optional)
* Collection selector

---

## 🟢 MODULE 3: DATA EXTRACTION

### Extract:

* title
* URL
* page content (cleaned)
* metadata

---

## 🟢 MODULE 4: API INTEGRATION

### Flow

```
Extension
   ↓
POST /api/items
   ↓
Backend stores data
```

---

## 🟢 MODULE 5: AUTH SYNC

* user login via token
* stored in extension storage

---

# 5. 🔁 END-TO-END FLOW

---

## Flow: Save from Extension

1. user clicks save
2. extension extracts content
3. sends to backend
4. backend:

   * saves metadata (MongoDB)
   * uploads file → **ImageKit**
   * queues AI job

---

## Flow: AI Processing

1. worker picks job
2. content → **Mistral AI**
3. generates:

   * embedding
   * tags
4. stored in vector DB

---

## Flow: Web App Usage

1. user opens dashboard
2. sees saved items
3. searches / chats
4. gets intelligent results

---

# 6. 🗂️ DATA MODEL

```json id="slk9fp"
Item {
  id,
  userId,
  type,
  title,
  content,
  url,
  fileUrl,
  tags[],
  embedding[],
  createdAt
}
```

---

# 7. ⚙️ TECH STACK SUMMARY

---

## Frontend

* React / Next.js

---

## Backend

* Node.js + Express

---

## AI

* **Mistral AI**

---

## Storage

* **ImageKit**

---

## Visualization

* **D3.js**

---

## Database

* MongoDB
* Vector DB

---

# 8. 📈 KPIs

* daily saves
* search usage
* chat usage
* resurfacing CTR
* retention

---

# 9. ⚠️ RISKS

* extension reliability (different sites)
* AI latency
* scaling embeddings
* cost management

---

# 🔥 BUILD ORDER (VERY IMPORTANT)

---

## STEP 1

* MERN auth + CRUD

## STEP 2

* Extension (basic save)

## STEP 3

* Storage (**ImageKit**)

## STEP 4

* AI embeddings (**Mistral AI**)

## STEP 5

* semantic search + related

## STEP 6

* AI chat

## STEP 7

* voice notes

## STEP 8

* graph + resurfacing

---

# 💡 FINAL CLARITY

👉 Web App = **brain + UI**
👉 Extension = **input system**

Dono milke bante hain:
👉 NeuroVault (complete system)

---

Agar tu next chahta hai, main tujhe directly de sakta hoon:

👉 full folder structure (frontend + backend + extension)
👉 API endpoints production ready
👉 extension ka real working code
👉 AI chat (RAG) ka exact implementation

bas bol 🔥
