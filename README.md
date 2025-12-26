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
  </p>

  <p><i>Building the future of personal preparation through intelligent context.</i></p>
  
  <br />
</div>

<hr />

## 📖 Table of Contents
- [Vision](#-vision)
- [Premium Features](#-premium-features)
- [Enterprise Admin & Testing Suite](#-enterprise-admin--testing-suite-powerful-controls)
- [Modern Tech Stack](#-modern-tech-stack)
- [Quick Start](#-quick-start)
- [Progress & Roadmap](#-progress--roadmap)
- [Contribution Strategy](#-contribution-strategy)

---

## 🌟 Vision

**Stratus** turns your chaotic morning routine into a streamlined, AI-optimized experience. By bridging the gap between your **class schedule** and **micro-local weather forecasts**, Stratus eliminates the guesswork of getting dressed. 

No more checking three different apps. No more carrying a jacket you won't need. Just pure, personalized intelligence that knows exactly what your day looks like.

---

## 🚀 Premium Features

### 📅 **AI Schedule Intelligence**
- **Multimodal Extraction**: Upload a PDF, a photo, or even a raw **.txt file** of your messy schedule. Our **Gemini 2.5 Flash Lite** engine extracts course names, times, and exact campus locations with surgical precision.
- **Manual Control**: Add, edit, or delete classes manually with a sleek, responsive interface.
- **Top-of-List Priority**: New additions always appear at the top for immediate focus.

### 🌤️ **Hyper-Local Context**
- **Campus-Specific Weather**: We don't just give you "city weather." We fetch hourly data for your specific university campus using the **Tomorrow.io API**.
- **Contextual Matching**: Our engine maps weather conditions (temp, precipitation, wind) to your exact class times, alerting you to changes *during* your transit.

### 👗 **Generative Styling Engine**
- **Micro-Recommendations**: Get a tailored outfit suggestion for *every single class* based on transitions between indoors and outdoors.
- **Master Strategy**: A synthesized "Outfit of the Day" that covers the volatility of your entire schedule.
- **Reasoning**: Understand the *why* behind every layer suggested.

### 👤 **Account & Personalization**
- **Seamless Auth**: Powered by **Auth0** for enterprise-grade security.
- **Cloud Sync**: Your university preferences and schedules are saved in **Supabase**, ready on any device.
- **Profile Mastery**: Customize your display name and manage your data with a few clicks.

---

## 🛡️ Enterprise Admin & Testing Suite: Powerful Controls

We utilize a robust **Admin Dashboard** designed for engineering leads to maintain system integrity and simulate edge cases without leaving the UI.

### 🧪 **The Testing Lab (Phase 4)**

<table align="center">
  <tr>
    <td align="center" width="50%">
        <h3>Unit Pulse & E2E Flow Checks</h3>
        <p>Our custom-built <a href="src/app/admin/tests/page.tsx">Testing Lab</a> integrates <b>Vitest</b> and <b>Playwright</b> directly into the application dashboard.</p>
        <ul>
            <li><b>One-Click Execution</b>: Run the full 100+ test suite with a single button press.</li>
            <li><b>Live Streaming Logs</b>: Watch unit tests pass in real-time via server-sent events (SSE).</li>
            <li><b>Network Interception</b>: We use advanced request interception to simulate API failures and maintenance modes, ensuring our frontend is bulletproof.</li>
        </uL>
    </td>
    <td align="center">
      <img src="https://img.icons8.com/isometric/512/experimental.png" width="100" />
    </td>
  </tr>
</table>

### 🎛️ **Operations Command Center**
The **Operations Panel** gives administrators god-mode control over the application state:
- **Emergency Maintenance Mode**: Instantly lock the application and display a sitewide maintenance banner. Useful during critical database migrations.
- **Token Analytics**: Real-time tracking of Gemini AI interactions, including estimated costs, token usage per model, and latency metrics.
- **System Broadcasts**: Push active "Notices" (Info, Warning, Critical) to all connected clients instantly.

### 🔍 **Quality Assurance at Scale**
We maintain a strict **100% Test Pass Rate** policy.
- **16 Unit/Integration Tests**: Validating core logic, date parsing, and weather matching.
- **5 End-to-End Flows**: Simulating a complete user journey from login to outfit recommendation.
- **Strict Mode Compliance**: Our E2E tests enforce strict accessibility and selector uniqueness to guarantee a high-quality UI.

---

## 🛠️ Modern Tech Stack

<table align="center">
  <tr>
    <td align="center" width="200">
      <b>Frontend</b><br />
      Next.js 15 (App)<br />
      React 19<br />
      Framer Motion<br />
      Lucide Icons
    </td>
    <td align="center" width="200">
      <b>Backend / AI</b><br />
      Gemini 2.5 Flash Lite<br />
      Tomorrow.io API<br />
      Node.js Runtime<br />
      Server Actions
    </td>
    <td align="center" width="200">
      <b>Infrastructure</b><br />
      Supabase (PostgreSQL)<br />
      Auth0 Authentication<br />
      Vercel Hosting<br />
      TypeScript 5
    </td>
  </tr>
</table>

---

## ⚡ Quick Start

### 1. Requirements
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Setup
```bash
git clone https://github.com/soroushrf/stratus.git
cd stratus
npm install
```

### 3. Environment Variables
Create a `.env` file with the following:
```env
# AI & Weather
GEMINI_API_KEY="your_key"
WEATHER_API_KEY="your_tomorrow_io_key"
USE_LIVE_WEATHER="true"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_role_key"

# Auth0
AUTH0_SECRET='your_secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your_client_id'
AUTH0_CLIENT_SECRET='your_client_secret'
```

### 4. Develop
```bash
npm run dev
```

---

## 🗺️ Progress & Roadmap

- [x] **Phase 1**: Core Setup & Tech Selection
- [x] **Phase 2**: AI Schedule Extraction (PDF/Image)
- [x] **Phase 3**: Tomorrow.io API Integration
- [x] **Phase 4**: Generative Styling Logic
- [x] **Phase 5**: User Accounts & Cloud Profiles (Supabase + Auth0)
- [x] **Phase 6**: Name Sync & UX Polish
- [ ] **Phase 7**: Social Sharing & Style History
- [ ] **Phase 8**: Native Mobile Wrapper (Capacitor)

---

## 🤝 Contribution Strategy

We follow a **Structured Git Flow**:

- `master`: **Production Gold**. Fully tested and stable.
- `main`: **Beta Staging**. Where features go to be validated.
- `backend-core`: API, Services, and Database logic.
- `frontend-ui`: Component design and state management.

---

<div align="center">
  <p>Crafted with ❤️ and ☕ by the <b>Stratus Team</b>.</p>
  <p>Built on the bleeding edge of the <b>Google Cloud & Vercel Ecosystem</b>.</p>
</div>
