# 🌩️ Stratus Master Quality & Performance Plan
*Created: December 26, 2025*

This document serves as the **Single Source of Truth** for the major architectural overhaul of Stratus. It merges refactoring, testing, and performance optimization into a unified workflow.

**Primary Objectives:**
1.  **🚀 Performance:** Eliminate implementation bottlenecks (like the `page.tsx` God Component) to speed up initial load and interaction times.
2.  **💎 Quality:** Implement a robust testing network to guarantee 99.9% reliability.
3.  **⚡ Velocity:** Decouple logical layers so implementing future features (e.g., new AI models) is instant and safe.

---

## **Phase 1: Architectural Decoupling (The "God Component" Fix)**
*Objective: Break the monolithic `page.tsx` to drastically improve rendering performance and testability. This must happen BEFORE E2E testing.*

### **Task 1.1: State Management Extraction** ✅ COMPLETE
*Why: Currently, any state change triggers a re-render of the entire dashboard. Moving logic to hooks fixes this.*
- [x] **Create `src/hooks/useDashboardData.ts`**:
  - Move "load saved data", "fetch user profile", and "fetch notices" logic here.
  - **Perf Win**: Use `SWR` or React Query (optional, or optimized `useEffect`) for caching data to prevent redundant fetches on navigation.
- [x] **Create `src/hooks/useWeatherAnalysis.ts`**:
  - Move `processSchedule`, `matchClassesToWeather`, and all associated state (`classes`, `weatherData`, `loadingStep`) here.
  - Return a clean interface: `{ analyze, loading, results, error }`.

### **Task 1.2: Component Atomization** ✅ COMPLETE
*Why: Enables code-splitting (Next.js loads only what's needed).*
- [x] **Extract `DashboardHeader`**: Moves the Navbar and Welcome message out.
- [x] **Extract `OnboardingWizard`**: Isolate the University/Campus selection logic.
- [x] **Extract `AnalysisView`**: Isolate the results grid (Weather + Attire + Schedule).
- [x] **Refactor `page.tsx`**: It should only be ~50 lines long, composing these components.

### **Task 1.3: Input Standardization (Zod)** ✅ COMPLETE
*Why: Fails fast on invalid input, saving expensive AI processing time/cost.*
- [x] **Create `src/lib/schemas.ts`**:
  - Define `UniversitySchema`, `ScheduleFileSchema`, `UserProfileSchema`.
- [x] **Apply to `actions.ts`**:
  - Validate inputs *before* calling Gemini/Tomorrow.io services.

---

## **Phase 2: Service Layer Hardening (Unit Testing)**
*Objective: Ensure the "Brain" of Stratus (AI & Algorithms) is flawless.*

### **Task 2.1: Testing Infrastructure**
- [ ] Install `vitest`, `msw`, `@testing-library/react`.
- [ ] Configure `vitest.config.ts` with path aliases.

### **Task 2.2: Core Logic Tests**
- [ ] **Weather Matcher (`src/lib/utils/weatherMatcher.ts`)**:
  - Test edge cases: Classes spanning midnight, timezone mismatches.
- [ ] **Start/End Date Resolver (`src/lib/utils/dateHelpers.ts`)**:
  - **Critical**: Ensure the app doesn't break when a user is in a different timezone than the university.

### **Task 2.3: Service Isolation Tests**
- [ ] **Gemini Service**:
  - Mock the AI response. Verify that prompted tokens are tracked correctly (Performance/Cost safety).
- [ ] **Weather Service**:
  - Ensure fallback logic works if Tomorrow.io is down.

---

## **Phase 3: Integration & API Integrity**
*Objective: Ensure the frontend communicates securely and efficiently with the backend.*

### **Task 3.1: API Performance Tuning**
- [ ] **Response Caching**:
  - Implement `Cache-Control` headers for `getUniversities` (universities rarely change).
- [ ] **Database Indexing Check**:
  - Verify Supabase tables (`users`, `user_profiles`) have indices on `user_id` and `email` for O(1) lookups.

### **Task 3.2: API Route Testing**
- [ ] **Auth Guards**:
  - Write tests to ensure NO API route works without a valid session.
- [ ] **Rate Limiting Simulation**:
  - Write a test script to spam the analysis endpoint and verify 429 logic works (if implemented) or log excessive usage.

---

## **Phase 4: User Experience & E2E Validation**
*Objective: Validate the "Stratus Experience" from a user's perspective.*

### **Task 4.1: Critical Path Automation (Playwright)**
- [ ] **Spec 1: The "Happy Path"**:
  - Login -> Upload Schedule -> Get Analysis.
  - **Perf Metric**: Use Playwright to enforce < 2s Time to Interactive on the dashboard.
- [ ] **Spec 2: Admin Control**:
  - Enable Maintenance Mode -> Verify User sees "Under Maintenance" immediately.

### **Task 4.2: Error Recovery UI**
- [ ] **Global Error Boundary**:
  - Create a sleek "Something went wrong" component so the app never whitescreens.
- [ ] **Toast Notification System**:
  - Unify all `alert()` calls into a beautiful Toast system (e.g., `sonner`).

---

## **Phase 5: Production Readiness**
*Objective: Final polish for speed and security.*

### **Task 5.1: Build Optimization**
- [ ] **Bundle Analysis**:
  - Run `@next/bundle-analyzer` to find large dependencies.
  - Lazy load heavy components (like the `framer-motion` intense parts if they block main thread).
- [ ] **Image Optimization**:
  - Audit all `img` tags to ensuring `next/image` usage with proper sizing.

### **Task 5.2: Security Sweep**
- [ ] **Dependency Audit**: `npm audit`.
- [ ] **Secret Rotation**: Rotate Supabase/Gemini keys before final "v1.0" stamp.

---

## **Execution Protocol**
1. **Stop adding features immediately.**
2. Begin **Phase 1** to untangle the code structure.
3. Once the structure is clean, **Phase 2 & 3** run in parallel.
4. **Phase 4** is the final gate before marking the project "Stable".
