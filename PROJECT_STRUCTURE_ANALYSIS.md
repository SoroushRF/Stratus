# Stratus Project Structure Analysis

## **Overall Efficiency Score: 78/100**

This project demonstrates a solid architectural foundation with a modern tech stack (Next.js 14, Supabase, Tailwind, Gemini). However, as it has grown, certain areas have accumulated technical debt that poses risks for scalability and testability.

---

## **✅ Strong Points**
1. **Service Layer Abstraction (`src/lib/services`)**:
   - Logic for AI (`gemini.ts`), Weather (`weather.ts`), and Config (`ai-config.ts`) is well-isolated.
   - This makes unit testing these specific parts very straightforward.

2. **Adaptive Backend (`actions.ts`)**:
   - The use of Server Actions as a thin adapter layer between the client and the service layer is excellent. It cleaner than having massive API route files.

3. **Dynamic Configuration**:
   - `AIConfigService` allows changing models/prompts without redeploying. This is a "production-ready" feature.

---

## **⚠️ Key Failures & Risk Areas**

### **1. The "God Component" Problem (Critical Failure)**
- **File**: `src/app/page.tsx` (> 800 lines)
- **Issue**: This single file handles:
  - Authentication logic
  - Data fetching (Universities, Notices, Saved Data)
  - UI state management (Loading steps, multiple modals)
  - Business logic coupling (Weather/Class matching)
- **Risk**: It is nearly impossible to test this page effectively with unit/integration tests. It also makes adding new features (like "Attire Presets") dangerous as you risk breaking existing flows.
- **Fix**: Break this down into feature-specific components (`<DashboardLogic />`, `<OnboardingFlow />`, `<AnalysisResultView />`) or move state logic to a custom hook (`useAnalysisFlow()`).

### **2. Client-Side Heavy Logic**
- **Issue**: Much of the logic in `page.tsx` runs on the client. While strict "Business Logic" is on the server, the *orchestration* of that logic happens in the UI.
- **Risk**: Security risks (bypassing steps) and performance warnings. Simple logic like "filtering classes by day" could be moved to shared utility hooks to be testable.

### **3. Inconsistent Data validation**
- **Issue**: While some API routes validate input, there is no standardized schemas (e.g., using `zod`).
- **Risk**: If the frontend sends malformed data (or a malicious user does), the service layer might crash unexpectedly.

### **4. Missing Global State Management**
- **Issue**: State is passed down via props or kept in `page.tsx`.
- **Risk**: Prop drilling makes refactoring hard. As features grow (e.g., "User Settings", "Past Analysis History"), managing state in the root page will become unmanageable.

---

## **Recommendations for Refactoring (Pre-Testing)**

Before implementing the full test suite, I highly recommend:

1. **Refactor `src/app/page.tsx`**: Extract the data loading `useEffect` hooks into a custom hook `useDashboardData()`. This makes it mockable.
2. **Standardize Inputs**: Create a `types/schemas.ts` file using Zod to validate inputs in `actions.ts`.

---

**Conclusion**: The project is in "Good" shape but is reaching the limit of its current structural organization. The backend is solid; the frontend is the bottleneck. The testing plan created is viable, but E2E tests will be flaky unless `page.tsx` is stabilized.
