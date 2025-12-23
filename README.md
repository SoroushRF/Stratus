<div align="center">
  <br />
  <h1>🌥️ S T R A T U S</h1>
  <h3>AI-Powered Weather & Attire Intelligence</h3>
  
  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google-gemini" alt="Gemini AI" /></a>
  </p>

  <p><i>Your personal AI stylist that knows your schedule and the weather.</i></p>
  
  <br />
</div>

<hr />

## 🌟 Overview

**Stratus** is a next-generation utility app that redefines how students and professionals prepare for their day. By intelligently combining **class schedules**, **real-time weather data**, and **generative AI**, Stratus provides hyper-personalized attire recommendations.

Instead of just checking the weather, Stratus tells you exactly *what to wear* based on where you need to be and when, ensuring you're never caught freezing in a lecture hall or overheating on a walk across campus.

---

## 🚀 Key Features

### 📅 **Intelligent Schedule Parsing**
- **AI-Driven Extraction**: Upload a PDF or image of your class schedule, and our Gemini-powered engine instantly extracts course names, times, and locations.
- **Privacy First**: Schedule processing happens securely server-side.

### 🌤️ **Context-Aware Weather Analysis**
- **Hyper-Local Forecasts**: Fetches hourly weather data specifically for your university campus.
- **Micro-Weather Matching**: Maps forecast data precisely to each class time, noting temperature, precipitation, and wind chill.

### 👗 **AI Stylist Engine**
- **Dynamic Recommendations**: Generates specific outfit advice for every single class (e.g., "Layer up for your 8 AM chem lab, shed the jacket for noon history").
- **Master Outfit Synthesis**: Creates a single "Outfit of the Day" strategy that works across all your day's varying conditions.
- **Reasoning Engine**: Explains *why* a certain outfit is recommended (e.g., "High humidity and mild temps suggest breathable fabrics").

### 🎨 **Modern User Experience**
- **Sleek Dashboard**: A minimal, high-aesthetic interface focused on clarity and utility.
- **Detailed Viz**: Visual breakdown of weather conditions throughout the day.
- **Interactive Parsing**: Review and confirm your schedule data before analysis.

---

## 🛠️ Technology Stack

**Frontend**
*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS & Glassmorphism design principles
*   **State**: React Hooks & Server Actions
*   **Localization**: Date & Time utilities

**Backend & AI**
*   **Runtime**: Node.js (Serverless on Vercel)
*   **AI Model**: Google Gemini 2.0 Flash Lite
*   **Weather Provider**: OpenWeatherMap OneCall 3.0 (Planned/Hybrid)
*   **Database**: SQLite (via Prisma) for future user preferences

**Infrastructure**
*   **Deployment**: Vercel
*   **Version Control**: Git / GitHub

---

## ⚡ Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/soroushrf/stratus.git
    cd stratus
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    # Required for Analysis
    GEMINI_API_KEY="your_google_gemini_key"
    
    # Optional / Future
    OPENWEATHER_API_KEY="your_openweather_key"
    USE_LIVE_WEATHER="false"
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to see the app live.

---

## 🗺️ Roadmap

| Phase | Status | Description |
| :--- | :---: | :--- |
| **Phase 1** | ✅ | **Core Setup**: Repo initialization, tech stack selection. |
| **Phase 2** | ✅ | **Schedule Parsing**: PDF/Image extraction pipeline. |
| **Phase 3** | ✅ | **Weather Integration**: Dummy data & matching logic. |
| **Phase 4** | ✅ | **AI Stylist**: Recommendation engine & master synthesis. |
| **Phase 5** | 🔄 | **UI Polish**: Collapsible cards, detailed weather tables. |
| **Phase 6** | 📅 | **Live Data**: Full OpenWeatherMap integration. |
| **Phase 7** | 🔮 | **User Accounts**: Save schedules and preferences. |

---

## 🤝 Contribution Workflow

We follow a strict **Git Flow** strategy to ensure stability.

*   `master`: **Production**. Live code only. No direct commits.
*   `main`: **Staging**. Integration testing area for frontend & backend.
*   `backend-dev`: Core logic, API, and services development.
*   `frontend-ui`: Styling, components, and UX enhancements.

---

<div align="center">
  <p>Built with ☕ and <a href="https://nextjs.org">Next.js</a> by the Stratus Team.</p>
</div>
