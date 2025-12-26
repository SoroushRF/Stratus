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
    <a href="#-the-quality-assurance-lab"><img src="https://img.shields.io/badge/Tests-102%20Passing-emerald?style=for-the-badge&logo=vitest" alt="Tests" /></a>
    <!-- NEW BADGE CI -->
    <a href="https://github.com/SoroushRF/Stratus/actions"><img src="https://img.shields.io/badge/CI%20Build-Passing-emerald?style=for-the-badge&logo=github-actions" alt="CI Build" /></a>
    <!-- NEW BADGE LICENSE -->
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" /></a>
  </p>

  <p><i>Building the future of personal preparation through intelligent context.</i></p>
  
  <br />
</div>

<hr />

## 📖 Table of Contents

- [🌌 The Vision](#-the-vision)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ The Arsenal (Tech Stack)](#-the-arsenal-tech-stack)
- [🧩 Core Intelligence Engine](#-core-intelligence-engine)
- [🛡️ The Enterprise Admin Nexus](#️-the-enterprise-admin-nexus)
- [🧪 The Quality Assurance Lab](#-the-quality-assurance-lab)
- [💾 Database Architecture](#-database-architecture)
- [🔐 Security & Compliance](#-security--compliance)
- [🚀 Local Development](#-local-development)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Seeding](#database-seeding)
  - [Running the App](#running-the-app)
- [☁️ Deployment](#️-deployment)
- [� API & Server Actions](#-api--server-actions)
- [🤝 Contributing](#-contributing)
- [🛣️ Roadmap](#️-roadmap)
- [❓ FAQ & Troubleshooting](#-faq--troubleshooting)

---

## 🌌 The Vision

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

## 🛠️ The Arsenal (Tech Stack)

We didn't just pick tools; we chose weapons. Stratus is forged with the absolute latest in web technology.

<div align="center">

| **Frontend Velocity** | **Intelligence Core** | **Ironclad Infra** |
| :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /> | <img src="https://img.shields.io/badge/Gemini%202.5-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" /> | <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" /> |
| <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" /> | <img src="https://img.shields.io/badge/Tomorrow.io-333333?style=for-the-badge&logo=googlecloud&logoColor=white" /> | <img src="https://img.shields.io/badge/Auth0-EB5424?style=for-the-badge&logo=auth0&logoColor=white" /> |
| <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /> | <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> | <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /> |
| <img src="https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" /> | <img src="https://img.shields.io/badge/Server%20Actions-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /> | <img src="https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> |

</div>

---

## 🧩 Core Intelligence Engine

Stratus operates on a three-phase intelligence pipeline: **Extract → Harmonize → Generate**.

### 1. AI-Driven Schedule Extraction (Gemini 2.5 Flash Lite)
Traditional OCR is brittle. Stratus uses **Multimodal LLMs** to "see" your schedule like a human does.
- **Visual Parsing**: Upload a blurry photo or a complex PDF grid. The model identifies days, times, and locations based on visual layout, not just text scraping.
- **Fuzzy Logic Correction**: It inferentially corrects typos (e.g., "MTH 101" -> "Math 101") and resolves partial time formats (e.g., "2-4" -> "14:00 - 16:00").

### 2. Temporal Weather Harmonization (Tomorrow.io)
City-wide forecasts are useless for a student walking across a 500-acre campus.
- **Geospatial Precision**: We map every supported university campus to exact latitude/longitude coordinates.
- **Temporal Slicing**: We fetch 24-hour hourly forecasts including temperature, wind chill ("RealFeel"), humidity, and precipitation probability.
- **The Matching Algorithm**: Our custom algorithm iterates through your parsed classes and "locks in" the weather conditions specifically for your commute times.

### 3. Generative Attire Reasoning (Context-Aware LLM)
This is the "Brain" of Stratus. It doesn't just output "Wear a coat."
- **Layering Strategy**: It analyzes the delta between your coldest outdoor walk and your heated lecture hall. If the variance is >15°F, it suggests removable layers.
- **Master Recommendation**: It synthesizes the entire day's volatility into a single "Strategy" to minimize decision fatigue.

---

## 🛡️ The Enterprise Admin Nexus

The **Admin Nexus** is not an afterthought; it is a first-class citizen of the Stratus ecosystem. Designed for Engineering Leads and System Operators, it provides "God Mode" capabilities over every facet of the application.

It is secured by a double-verification layer (Auth0 Role Check + Supabase Database Verification) ensuring that even if one layer is compromised, administrative functions remain secure.

### Technological Governance
The admin panel provides deep insights into the AI performance and API consumption:
- **Token Telemetry**: A real-time dashboard visualizing Gemini API usage. It breaks down input vs. output tokens, calculating an estimated daily burn rate to prevent cost overruns.
- **Model Efficiency Tracking**: Administrators can audit latency distribution across different Gemini models (`1.5-flash` vs `2.0-flash-exp`) to make data-driven decisions on which model to deploy for production.
- **System Health Monitor**: A live pulse of external dependencies (Supabase, Auth0, Tomorrow.io).

### User & Data Sovereignty
From the `/admin/users` and `/admin/universities` routes, admins possess granular control:
- **RBAC Management**: Instantly promote or demote users to Administrator status.
- **University Asset Management**: A CRUD interface for managing the global university database. Admins can update campus coordinates, adjusting the specific "Weather Center Point" for thousands of students instantly.
- **User Lifecycle Control**: The ability to inspect user profiles, debug sync issues, and ban bad actors from the platform.

### Operations Command Center
The `/admin/operations` route is the mission control for site reliability:
- **Emergency Maintenance Mode**: A "Kill Switch" that instantly locks the frontend.
  - *UseCase*: During a critical DB migration, an admin toggles this switch. API routes immediately begin rejecting non-admin requests with `503 Service Unavailable`, and the UI renders a beautiful, informative Maintenance Screen to end-users.
- **Global Broadcast System**: A notification engine allowing admins to push "System Notices" (Info, Warning, Critical) to all connected clients.
  - *Feature*: Notices support expiration times (`expires_at`), ensuring that "System Degradation" alerts automatically disappear once the incident window passes.

---

## 🧪 The Quality Assurance Lab

Reliability is a feature. At Stratus, we treat our test suite as the supreme source of truth. We have integrated a full **CI/CD Dashboard** directly into the application at `/admin/tests`.

### Testing Philosophy
We employ a **"Testing Trophy"** strategy, heavily emphasizing Integration and E2E tests over brittle unit tests.
- **Realism over Mocking**: Whenever possible, we test against real data structures. When we do mock, we use **Network Interception** (via Playwright) rather than fragile implementation-detail mocking.
- **Strict Mode Compliance**: Our UI tests enforce accessibility. We do not select elements by CSS classes (which change). We select by **Role** and **Label**, ensuring our app remains usable for screen readers.

### The E2E Testing Pipeline
Our End-to-End suite (powered by **Playwright**) is rigorous:
1.  **The "Happy Path"**: Simulates a complete user journey—Landing Page -> Login -> Schedule Upload (Mock) -> Analysis -> Dashboard.
2.  **The "Chaos Path"**: Simulates network failures, maintenance modes, and malformed API responses to ensure the UI handles errors gracefully.
3.  **Visual Regression**: Every pixel is accounted for. The tests verify that the "Layering Strategy" text appears exactly where expected, with the correct casing and visibility.

### Metric: 102 Tests Passing
As of the latest build, Stratus boasts a **100% Green** status across **102 distinct tests**:
- **16 Unit/Integration Tests**: Validating complex date math (e.g., "What is the date of the next Monday?"), weather data parsing, and coordinate mapping.
- **5 Critical E2E Flows**: Covering the entire application surface area.
- **81 Parametrized Cases**: Ensuring edge cases (Leap years, midnight classes, empty schedules) are handled deterministically.

This suite is runnable directly from the Admin Dashboard, streaming logs via Server-Sent Events (SSE) so non-technical stakeholders can verify system health.

#### Run Tests Locally
```bash
npm run test        # Run Unit & Integration Tests (Vitest)
npm run test:e2e    # Run E2E Tests (Playwright)
npm run test:ui     # Open Vitest UI
```

---

## � Database Architecture

Our Supabase (PostgreSQL) schema relies on a user-centric relational model.

| Table | Description | Key Fields |
| :--- | :--- | :--- |
| **users** | Core profile linked to Auth0 ID | `id` (PK), `email`, `university_id`, `onboarding_completed` |
| **schedules** | Parsed daily schedules | `id` (PK), `user_id` (FK), `raw_content` (Text/JSON), `is_active` |
| **universities** | Geo-spatial campus data | `id` (PK), `name`, `latitude`, `longitude`, `timezone` |
| **notices** | System-wide broadcasts | `id` (PK), `message`, `type` (info/crit), `is_active` |
| **admin_audit** | Security logs for admin actions | `id`, `admin_id`, `action`, `resource`, `timestamp` |

> See [docs/architecture.md](./docs/architecture.md) for the full Entity-Relationship Diagram (ERD).

---

## �🔐 Security & Compliance

Stratus handles sensitive user data (location habits, schedules). We treat security as paramount.

- **Authentication**: **Auth0** handles identity management (OIDC compliant). We never touch passwords.
- **Database Security**:
  - **RLS (Row Level Security)**: Every query to Supabase is filtered by the standard `auth.uid()` policy plus custom security definers. A user physically *cannot* fetch another user's schedule.
  - **Policy Enforcement**: `SELECT`, `INSERT`, `UPDATE` policies are strictly defined in [`SECURITY_RLS_POLICIES.sql`](./SECURITY_RLS_POLICIES.sql).
- **Environment Isolation**: API Keys (Gemini, Tomorrow.io) are kept server-side. The client never sees a raw API token.

---

## 🚀 Local Development

### Prerequisites
- **Node.js** v18.x (LTS) or higher
- **npm** (v9+) or **pnpm**
- **Git**

### Environment Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/soroushrf/stratus.git
    cd stratus
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```
3.  **Configure Environment**:
    Copy the example file and fill in your secrets.
    ```bash
    cp .env.example .env
    ```
    > **Note**: You will need API keys for Google Gemini, Tomorrow.io, and a Supabase instance URL/Key. See [Getting API Keys](#how-to-get-api-keys) below.

### Database Seeding
To spin up a local admin user or standard test user:
```bash
# (Placeholder script) - Use Supabase Dashboard for now or run:
# npm run seed
# TODO: Implement local seed script
```
*Tip: To create an admin, manually update the `is_admin` flag in your local Supabase `users` table row.*

### Running the App
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

### Quick Commands Table

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start local dev server with Hot Module Replacement |
| `npm run build` | Compile for production (Next.js build) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint check |
| `npm run test` | Execute Vitest unit suite |
| `npm run test:e2e` | Execute Playwright E2E suite |

---

## ☁️ Deployment

We recommend **Vercel** for zero-configuration deployment.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add your **Environment Variables** (copy from `.env`).
4.  **Edge Functions**: Ensure your Supabase region is geographically close to your Vercel Function Region (e.g., `us-east-1`) to minimize latency.

*Self-hosting*: You can build a Docker container using the standard Next.js Dockerfile pattern, but you will lose Edge Function capabilities unless you use a compatible runtime.

---

## 🔌 API & Server Actions

Stratus uses **Server Actions** (`src/app/actions.ts`) for 90% of data mutations. This ensures type safety and eliminates the need for a separate API layer documentation for internal features.

**Public Endpoints**:
- `POST /api/auth/hooks`: Webhook for Auth0 Post-Registration (syncs user to Supabase).
- `GET /api/cron/weather-cache`: (Protected) Revalidates campus weather data.

---

## 🤝 Contributing

We welcome contributions to the stratosphere! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes following **Conventional Commits** (`git commit -m 'feat: add amazing feature'`).
4.  Push to the branch.
5.  Open a Pull Request.

---

## 🛣️ Roadmap

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

## ❓ FAQ & Troubleshooting

**Q: My "Mock Mode" tests are failing?**
A: Ensure `MOCK_AI=true` is set in your test environment. Check `src/lib/services/attire.ts` for the "Magic String" triggers.

**Q: How do I get an Admin Account?**
A: After logging in via Auth0, manually go to your Supabase `users` table and set `is_admin = true` for your UUID.

**Q: I'm getting Auth0 redirect errors locally.**
A: Ensure your `AUTH0_BASE_URL` is set to `http://localhost:3000` and that this URL is whitelisted in your Auth0 Application settings.

---

<div align="center">
  <p><b>Stratus</b> is open-source software licensed under the <a href="./LICENSE">MIT License</a>.</p>
  <p>Crafted with obsession by Soroush and the Stratus Engineering Team.</p>
</div>
