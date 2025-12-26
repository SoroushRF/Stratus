<div align="center">
  <img src="https://img.icons8.com/isometric/512/cloud.png" width="128" height="128" alt="Stratus Logo" />
  <br />
  <h1>🌥️ S T R A T U S</h1>
  <h3>AI-Powered Weather & Attire Intelligence</h3>
  
  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-DB-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" /></a>
    <a href="https://auth0.com"><img src="https://img.shields.io/badge/Auth0-Security-EB5424?style=for-the-badge&logo=auth0" alt="Auth0" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google-gemini" alt="Gemini AI" /></a>
    <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Tests-102%20Passing-emerald?style=for-the-badge&logo=vitest" alt="Tests" /></a>
  </p>

  <p><i>Building the future of personal preparation through intelligent context.</i></p>
  
  <br />
</div>

<hr />

## 📖 Table of Contents

- [🌌 The Vision](#-the-vision)
- [🏗️ System Architecture](#️-system-architecture)
- [🧩 Core Intelligence Engine](#-core-intelligence-engine)
  - [AI-Driven Schedule Extraction](#1-ai-driven-schedule-extraction-gemini-25-flash-lite)
  - [Temporal Weather Harmonization](#2-temporal-weather-harmonization-tomorrowio)
  - [Generative Attire Reasoning](#3-generative-attire-reasoning-context-aware-llm)
- [🛡️ Enterprise Operations Suite](#️-enterprise-operations-suite)
- [🧪 The Quality Assurance Lab](#-the-quality-assurance-lab)
- [🔐 Security & Compliance](#-security--compliance)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [🛣️ Roadmap](#️-roadmap)

---

## � The Vision

We live in an era of information overload. Students and professionals juggle fragmented data every morning: a PDF class schedule, a weather app showing "average" city temperatures, and a wardrobe full of unorganized clothes.

**Stratus** turns this chaos into order.

It is not just a weather app. It is a **Context Engine**. By understanding exactly *where* you need to be and *when*, Stratus acts as a hyper-intelligent layer between your calendar and the atmosphere. It eliminates the cognitive load of preparation, answering the only question that matters: *"What should I wear to survive today?"*

---

## 🏗️ System Architecture

Stratus is built on a **Serverless, Edge-First Architecture** designed for speed, scalability, and resilience.

### **Frontend Layer (The Experience)**
- **Next.js 15 (App Router)**: Utilizing React Server Components (RSC) to minimize client-side bundle size while delivering dynamic, interactive UI.
- **Micro-Interactions**: Powered by `framer-motion`, every hover, transition, and loading state is choreographed to feel fluid and premium.
- **Glassmorphism Design System**: A custom Tailwind CSS implementation that uses backdrop-blur, variable transparency, and noise textures to create a deep, modern aesthetic.

### **Backend Layer (The Intelligence)**
- **Server Actions**: We bypass traditional API routes for direct, type-safe mutations from the client to the database/AI services.
- **Edge Routing**: Critical logic runs close to the user, ensuring sub-100ms latency for initial renders.
- **Supabase (BaaS)**: Managed PostgreSQL provides robust relational data storage with Row Level Security (RLS) policies baked into the schema.

---

## 🧩 Core Intelligence Engine

Stratus operates on a three-phase intelligence pipeline: **Extract → Harmonize → Generate**.

### 1. AI-Driven Schedule Extraction (Gemini 2.5 Flash Lite)
Traditional OCR is brittle. Stratus uses **Multimodal LLMs** to "see" your schedule like a human does.
- **Visual Parsing**: Upload a blurry photo or a complex PDF grid. The model identifies days, times, and locations based on visual layout, not just text scraping.
- **Fuzzy Logic Correction**: It inferentially corrects typos (e.g., "MTH 101" -> "Math 101") and resolves partial time formats (e.g., "2-4" -> "14:00 - 16:00").
- **Security**: Files are processed in-memory and never permanently stored unless explicitly saved by the user.

### 2. Temporal Weather Harmonization (Tomorrow.io)
City-wide forecasts are useless for a student walking across a 500-acre campus.
- **Geospatial Precision**: We map every supported university campus to exact latitude/longitude coordinates.
- **Temporal Slicing**: We fetch 24-hour hourly forecasts including temperature, wind chill ("RealFeel"), humidity, and precipitation probability.
- **The Matching Algorithm**: Our custom algorithm iterates through your parsed classes and "locks in" the weather conditions specifically for your commute times (15 mins before/after class).

### 3. Generative Attire Reasoning (Context-Aware LLM)
This is the "Brain" of Stratus. It doesn't just output "Wear a coat."
- **Layering Strategy**: It analyzes the delta between your coldest outdoor walk and your heated lecture hall. If the variance is >15°F, it suggests removable layers.
- **Material Awareness**: It recommends specific materials (e.g., "Gore-Tex for high wind," "Cotton for breathable indoor comfort").
- **Master Recommendation**: It synthesizes the entire day's volatility into a single "Strategy" (e.g., "The Morning Commuter Strategy") so you don't have to micromanage.

---

## 🛡️ Enterprise Operations Suite

Stratus includes a production-grade **Operations Command Center** (`/admin/operations`), giving Engineering Leads absolute control over the platform's health and resources.

### **🎛️ Dynamic Logic Controllers**
- **Maintenance Circuit Breaker**: Instantly sever client access to AI features if an upstream provider goes down. This renders a global "System Maintenance" banner and prevents cascading failures.
- **Feature Flagging**: Toggle experimental features (like "Live Weather" vs "Cached Weather") in real-time without redeploying.

### **📊 Cost & Token Telemetry**
- **Live Usage Tracking**: We monitor every Gemini API call. The dashboard visualizes:
  - **Input/Output Tokens**: To optimize prompt engineering costs.
  - **Latency Distribution**: To identify slow model responses.
  - **Estimated Burn Rate**: Real-time dollar cost estimation based on current traffic.
- **Model Efficiency**: Compare usage stats between `gemini-1.5-flash` and `gemini-2.0-flash-exp` to make data-driven infrastructure decisions.

### **📢 Broadcast System**
- **System Notices**: Push persistent alerts to all connected clients.
  - **Types**: Info, Warning, Critical, Maintenance.
  - **Scheduling**: Set expiration times for notices so they auto-clear after an incident is resolved.

---

## 🧪 The Quality Assurance Lab

We believe that **reliability is a feature**. Stratus maintains a **100% Test Pass Rate** policy, enforced by a custom-built In-App Testing Lab (`/admin/tests`).

### **Continuous Integration Dashboard**
Developers can execute the entire test suite directly from the Production UI to verify live environment health.

| Suite Type | Scope | Technology | Coverage Targets |
|:--- |:--- |:--- |:--- |
| **Unit Pulse** | Utility Logic | **Vitest** | Date calculations, Type validation, Data parsers. |
| **E2E Flow** | User Journey | **Playwright** | Full browser simulation: Login $\to$ Analysis $\to$ Result. |
| **Network** | Integration | **MSW / Route** | API Response structures, Error handling. |

### **Advanced Testing Patterns**
- **Network Interception**: Our E2E tests do not rely on flaky backend state. We use `page.route` to intercept network requests at the browser level, forcing the UI to handle 404s, 500s, and Maintenance Modes deterministically.
- **Visual Regression**: We inspect DOM elements for exact text matches, ensuring the AI's "Creative" output doesn't break the UI layout.
- **Strict Mode Compliance**: All selectors use strict accessibility locators (e.g., `getByRole`, `getByLabel`), ensuring the app remains accessible to screen readers.

---

## 🔐 Security & Compliance

Stratus handles sensitive user data (location habits, schedules). We treat security as paramount.

- **Authentication**: **Auth0** handles identity management (OIDC compliant). We never touch passwords.
- **Database Security**:
  - **RLS (Row Level Security)**: Every query to Supabase is filtered by the standard `auth.uid()` policy. A user physically *cannot* fetch another user's schedule, even if they manipulate the API client.
  - **Policy Enforcement**: `SELECT`, `INSERT`, `UPDATE` policies are strictly defined in `SECURITY_RLS_POLICIES.sql`.
- **Environment Isolation**: API Keys (Gemini, Tomorrow.io) are kept server-side. The client never sees a raw API token.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js 18+ (LTS Recommended)
- npm or pnpm
- A Google Cloud Project (for Gemini API)
- A Supabase Project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/soroushrf/stratus.git

# Enter the stratosphere
cd stratus

# Install dependencies like a pro
npm install
```

### 3. Configuration
Create a `.env` file in the root. Do not commit this file.
```env
# --- Intelligence Core ---
GEMINI_API_KEY="AIzaSy..."
WEATHER_API_KEY="wXyZ..."

# --- Database Layer ---
NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhh..."
SUPABASE_SERVICE_ROLE_KEY="eyJhb..."

# --- Identity Layer ---
AUTH0_SECRET='long_random_string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-xyz.us.auth0.com'
AUTH0_CLIENT_ID='abc...'
AUTH0_CLIENT_SECRET='123...'
```

### 4. Launch
```bash
# Ignite the development server
npm run dev
```
Visit `http://localhost:3000` to begin the experience.

---

## �️ Roadmap

Stratus is evolving. Here is our flight path for the next fiscal quarter:

- [x] **Phase 1: Foundation**: Architecture setup, Next.js 15 integration.
- [x] **Phase 2: The Eye**: Multimodal Schedule Extraction (PDF/Image).
- [x] **Phase 3: The Atmosphere**: Tomorrow.io API integration with localized weather.
- [x] **Phase 4: The Brain**: Generative Styling Logic & Context Engine.
- [x] **Phase 5: Identity**: User Accounts, Cloud Profiles (Supabase + Auth0).
- [x] **Phase 6: Polish**: Experience refinement, Micro-interactions.
- [ ] **Phase 7: Social**: "Outfit Checks", Social Sharing, Style History.
- [ ] **Phase 8: Omnipresence**: Native Mobile Wrapper (Capacitor/React Native).

---

<div align="center">
  <p><b>Stratus</b> is open-source software licensed under the MIT License.</p>
  <p>Crafted with obsession by the Stratus Engineering Team.</p>
</div>
