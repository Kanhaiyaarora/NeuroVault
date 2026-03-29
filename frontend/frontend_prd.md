Perfect bhai — ab main tujhe **FINAL, COMPLETE, PRODUCTION-LEVEL FRONTEND PRD** de raha hoon for **NeuroVault** 🔥
👉 Isme sab kuch included hai: UI, UX, architecture, AI, graph, media, animations
👉 Inspired by modern AI dashboards (jaise tu ne diya reference: **DataNest AI** style — clean, minimal, data-first layout)

---

# 📄 **NEUROVAULT – FRONTEND PRD (FINAL MASTER DOCUMENT)**

---

# 🧠 1. PRODUCT OVERVIEW

## Product: **NeuroVault (Frontend)**

NeuroVault frontend is a **hybrid AI dashboard + knowledge system UI**

👉 Core Purpose:

* capture knowledge
* visualize connections
* interact via AI
* consume content (video, PDF, article)

---

# 🎯 2. DESIGN PHILOSOPHY

Inspired from modern AI dashboards:

* minimal + dark theme
* card-based layout
* sidebar navigation
* focus on content + AI

📌 Insight: Poor UI makes even strong AI feel weak ([Hei Yan Quan][1])

---

# ⚙️ 3. TECH STACK

---

## Core

* React
* Redux Toolkit
* React Router DOM

---

## Styling

* Tailwind CSS

---

## Icons

* **Lucide React**

---

## Animations

* **Framer Motion**
* **GSAP**
* **Lenis**

---

## Visualization

* **D3.js**

---

## Notifications

* **React Toastify**

---

## Security

* **bcryptjs**

---

# 🏗️ 4. FRONTEND ARCHITECTURE

```id="final-arch"
Pages
 ↓
Components
 ↓
Redux Store
 ↓
API Layer (Axios)
 ↓
Backend
```

---

# 📁 5. FOLDER STRUCTURE

```id="final-folder"
frontend/
│
├── public/
├── src/
│
│   ├── app/                # redux store
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── routes/
│   ├── styles/
│   ├── App.jsx
│   ├── main.jsx
```

---

# 📄 6. CORE PAGES

---

## 🟢 AUTH

* Login
* Signup

---

## 🟢 DASHBOARD (MAIN SCREEN)

### Sections:

* recent items
* resurfaced items
* quick actions

---

## 🟢 ITEMS PAGE

* grid/list view
* filters
* search

---

## 🟢 ITEM DETAIL (🔥 MOST IMPORTANT)

---

### Dynamic Rendering

```id="renderer-final"
switch(type):
 youtube → video player
 article → read mode
 pdf → viewer
 image → preview
```

---

### Features:

#### 🎥 YouTube

* embedded player
* open original

---

#### 📄 Article

* clean reading UI
* highlights

---

#### 📕 PDF

* in-app preview
* zoom

---

#### 🖼️ Image

* fullscreen view

---

---

## 🔵 SEARCH PAGE

* semantic search
* filters (type, tags)

---

## 🔵 AI CHAT PAGE

---

### UI:

* chat bubbles
* input box
* typing animation

---

### Features:

* answers from saved data
* show sources

---

## 🟣 KNOWLEDGE GRAPH PAGE

Using:
👉 **D3.js**

---

### Features:

* nodes = items
* edges = relations
* zoom + pan
* click → open item

---

## 🔴 VOICE NOTES PAGE

* record button
* upload audio
* auto convert to text

---

# 🧩 7. COMPONENT ARCHITECTURE

---

## GLOBAL COMPONENTS

```id="global-components"
Navbar
Sidebar
Button
Input
Modal
Loader
Toast
```

---

## CORE COMPONENTS

---

### Items

* ItemCard
* ItemList
* ItemRenderer (🔥 core)

---

### Media

* YouTubePlayer
* PDFViewer
* ImageViewer

---

### Chat

* ChatBox
* MessageBubble
* ChatInput

---

### Graph

* GraphCanvas
* Node
* Edge

---

# 🧠 8. REDUX STATE DESIGN

---

```id="redux-final"
authSlice
itemSlice
searchSlice
chatSlice
uiSlice
```

---

## Responsibilities

* auth → user data
* item → items + selected item
* search → results
* chat → messages
* ui → modals + sidebar

---

# 🔁 9. USER FLOWS

---

## Save & View

```id="flow-save"
Save item → API → Redux → UI update
```

---

## Search

```id="flow-search"
Input → debounce → API → results
```

---

## Chat

```id="flow-chat"
Message → API → AI response → render
```

---

## Graph

```id="flow-graph"
Fetch → render → interact → open item
```

---

# 🎨 10. UI/UX SYSTEM

---

## Layout

* left sidebar
* top navbar
* main content area

---

## Sidebar

* Dashboard
* Items
* Search
* Chat
* Graph

---

## Design Style

* dark theme
* soft shadows
* rounded cards
* minimal clutter

---

# 🎬 11. ANIMATION SYSTEM

---

## Framer Motion

* page transitions
* modal animations

---

## GSAP

* graph animations
* advanced interactions

---

## Lenis

* smooth scrolling

---

# 🔗 12. API LAYER

---

```id="api-layer"
auth.api.js
item.api.js
search.api.js
chat.api.js
```

---

## Features

* axios instance
* token interceptor
* error handling

---

# 📱 13. RESPONSIVENESS

---

## Strategy

* mobile-first
* Tailwind breakpoints

---

## Mobile Changes

* sidebar → drawer
* graph → simplified
* chat → full screen

---

# 🔔 14. NOTIFICATIONS

Using:
👉 **React Toastify**

---

## Use Cases

* success
* error
* actions

---

# ⚠️ 15. RISKS

* graph performance
* heavy media load
* animation lag
* mobile UX complexity

---

# 🔥 16. BUILD ORDER (IMPORTANT)

---

## STEP 1

* auth + layout

## STEP 2

* dashboard

## STEP 3

* item UI + renderer

## STEP 4

* media support (YT + PDF)

## STEP 5

* search

## STEP 6

* chat

## STEP 7

* graph

## STEP 8

* voice

---

# 💡 FINAL SUMMARY

NeuroVault frontend is:

👉 UI + AI + Visualization system

* React = structure
* Redux = state
* Tailwind = UI
* D3 = graph
* AI = intelligence layer

---

# 🧠 FINAL DEV INSIGHT (IMPORTANT)

👉 sabse important cheez:

* ItemRenderer (content engine)
* Chat UI (retention engine)
* Graph (wow factor)


