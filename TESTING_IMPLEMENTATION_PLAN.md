# Stratus Testing Implementation Plan

This document outlines the phased approach to implementing a comprehensive testing suite for the Stratus application. Each phase is designed to be completed sequentially to build a robust quality assurance foundation.

## **Phase 1: Foundation & Unit Testing (Service Layer)**
*Objective: Ensure the core business logic and external service integrations work correctly in isolation.*

### **Task 1.1: Environment Setup**
- [ ] **Install Testing Dependencies**:
  - Install `vitest` (or Jest) as the test runner.
  - Install `@testing-library/react` for component utilities if needed later.
  - Install `msw` (Mock Service Worker) for intercepting network requests.
- [ ] **Configure Test Runner**:
  - Create `vitest.config.ts`.
  - Set up path aliases (`@/`) to match `tsconfig.json`.
  - Configure environment variables for testing (e.g., `.env.test`).
- [ ] **Create Test Directory Structure**:
  - `src/__tests__/unit`
  - `src/__mocks__`

### **Task 1.2: Mocking Strategy**
- [ ] **Mock External APIs**:
  - Create MSW handlers for Gemini API.
  - Create MSW handlers for Tomorrow.io Weather API.
  - Create MSW handlers for Auth0.
- [ ] **Mock Database Client**:
  - Create a mock implementation for `supabaseAdmin` to avoid hitting the real DB during unit tests.

### **Task 1.3: Service Layer Unit Tests**
- [ ] **Test `src/lib/services/gemini.ts`**:
  - Subtask: Verify prompt formatting with various inputs.
  - Subtask: Test successful response parsing.
  - Subtask: Test error handling (API down, invalid key).
  - Subtask: Verify token usage logging logic.
- [ ] **Test `src/lib/services/weather.ts`**:
  - Subtask: Verify URL construction for Tomorrow.io.
  - Subtask: Test data transformation (raw API response -> Stratus format).
  - Subtask: Test execution limit logic (daily quota).
- [ ] **Test `src/lib/services/attire.ts`**:
  - Subtask: Verify generation of attire recommendations based on weather codes.
  - Subtask: Test integration logic between weather data and Gemini prompt.
- [ ] **Test `src/lib/services/ai-config.ts`**:
  - Subtask: Test fetching configs (caching behavior).
  - Subtask: Test fallback values when DB is unreachable.

---

## **Phase 2: Integration Testing (API & Database)**
*Objective: Verify that API routes correctly process requests, interact with the database, and return expected responses.*

### **Task 2.1: Integration Environment Setup**
- [ ] **Test Database Setup**:
  - Configure a local Supabase instance or a separate test project.
  - Create SQL seed scripts to populate the DB with test users/configs/logs.
- [ ] **HTTP Testing Client**:
  - Install `supertest` or use Next.js native testing capabilities to simulate API calls.

### **Task 2.2: User API Tests**
- [ ] **Test `/api/user/profile`**:
  - Subtask: POST - Create new profile (validate inputs, DB insert).
  - Subtask: GET - Fetch profile (verify auth protections).
- [ ] **Test `/api/user/schedule`**:
  - Subtask: POST - Parse ICS file content and save.
  - Subtask: Verify parsing logic implementation within the route.

### **Task 2.3: Analysis API Tests**
- [ ] **Test `/api/analysis/weather`**:
  - Subtask: POST - Full flow (Auth -> Weather Service -> Gemini Service -> DB Log -> Response).
  - Subtask: Verify "Maintenance Mode" blocks requests.
  - Subtask: Verify API usage limits block requests when exceeded.
- [ ] **Test `/api/analysis/attire`**:
  - Subtask: POST - Full flow verification.

### **Task 2.4: Admin API Tests**
- [ ] **Test `/api/admin/operations`**:
  - Subtask: GET - Verify admin-only access control.
  - Subtask: POST - Toggle maintenance mode.
  - Subtask: POST - Create system notices.
- [ ] **Test `/api/admin/data`**:
  - Subtask: GET - Verify correct data aggregation for stats.

---

## **Phase 3: End-to-End (E2E) Testing**
*Objective: Simulate real user behavior to ensure critical paths work from the browser to the backend.*

### **Task 3.1: E2E Setup**
- [ ] **Install Playwright**:
  - Configure browsers (Chromium, Firefox, WebKit).
  - Set up authentication state storage (avoid logging in for every test).
- [ ] **CI Configuration**:
  - Ensure E2E tests can run in a headless environment.

### **Task 3.2: Critical User Journeys**
- [ ] **Onboarding Flow**:
  - Subtask: Simulate Auth0 login.
  - Subtask: Complete profile setup form.
  - Subtask: Verify redirect to dashboard.
- [ ] **Analysis Flow**:
  - Subtask: Upload a sample schedule file.
  - Subtask: Click "Analyze Weather".
  - Subtask: Verify results cards appear in the UI.

### **Task 3.3: Critical Admin Journeys**
- [ ] **Operations Flow**:
  - Subtask: Admin login.
  - Subtask: Navigate to Operations page.
  - Subtask: Enable "Maintenance Mode".
  - Subtask: Verify a regular user sees the maintenance block message.
  - Subtask: Disable "Maintenance Mode".

---

## **Phase 4: Optimization, CI/CD & Maintenance**
*Objective: Automate testing and ensure long-term stability.*

### **Task 4.1: CI/CD Pipeline**
- [ ] **GitHub Actions Workflow**:
  - Subtask: Trigger on Pull Request.
  - Subtask: Run Unit Tests.
  - Subtask: Run Integration Tests.
  - Subtask: Build project (ensure no build errors).
- [ ] **Security Scanning**:
  - Subtask: Add `npm audit` or similar security checks to pipeline.

### **Task 4.2: Documentation & Cleanup**
- [ ] **Write Testing Documentation**:
  - How to run tests locally (`npm test`).
  - How to add new tests.
  - Explanation of the mocking strategy.
- [ ] **Refactor**:
  - Identify and fix any flaky tests.
  - Optimize test execution speed.
