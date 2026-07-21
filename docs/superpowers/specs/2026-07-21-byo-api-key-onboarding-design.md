# Specification: Bring Your Own API Key (BYO-API-Key) Onboarding Redirection Flow

**Date:** 2026-07-21  
**Status:** Proposed  

## Goal
To require every user to configure their own LLM API key/endpoint (OpenAI Compatible, Anthropic Compatible, or Gemini) upon signing up or logging in, blocking access to the platform's core dashboard and features until a valid API key config is registered.

---

## Technical Approach

### 1. Backend Changes
We will modify the backend `/api/ai/config` GET endpoint to explicitly verify if the user has personally configured at least one API key, distinct from any server fallback keys.

- **File to Edit:** [ai-config.router.ts](file:///c:/Users/heman/base/Projects/marko/backend/src/modules/ai-config/ai-config.router.ts)
- **Change:** 
  Add a property `userHasKey` to the returned configuration JSON:
  ```typescript
  const userHasKey = Boolean(config?.geminiApiKey || config?.openaiApiKey || config?.anthropicApiKey);
  ```

---

### 2. Frontend Routing & Protection
We will implement route guards to check the user's AI configuration and enforce the onboarding step.

- **File to Edit:** [app-shell.tsx](file:///c:/Users/heman/base/Projects/marko/frontend/src/components/layout/app-shell.tsx)
- **Change:**
  1. Fetch the user's AI configuration status.
  2. If the user does not have a configured key (`userHasKey === false`) and they are not currently on `/onboarding`, redirect them to `/onboarding`.
  3. If they do have a key and try to visit `/onboarding`, redirect them back to `/dashboard`.

---

### 3. Onboarding Page Component
We will create a new onboarding route and a premium React page component.

- **File to Create:** `frontend/src/pages/OnboardingPage.tsx`
- **Route URL:** `/onboarding`
- **User Interface Specs:**
  - Modern, clean layout with the Bauhaus aesthetics matching the platform.
  - Quick, interactive selector cards:
    - **OpenAI Compatible Engine** (e.g., OpenAI, DeepSeek, OpenRouter, Groq, local models)
    - **Anthropic Compatible Engine** (e.g., Anthropic, AWS Bedrock proxy)
    - **Gemini Engine**
  - Inputs for:
    - `Base URL` (Pre-filled defaults, editable for OpenAI/Anthropic compatibles).
    - `API Key` (Encrypted field).
    - `Model Name` (e.g. `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`).
  - Validation Button to dry-run/verify key before finalizing.

---

## Validation / Testing Plan
1. **Mock Test:** Log in with a fresh user without keys → Verify redirection to `/onboarding`.
2. **Access Control:** Try to navigate manually to `/dashboard` or `/courses` → Verify page immediately redirects back to `/onboarding`.
3. **Key Integration:** Save a valid OpenAI/Gemini/Anthropic compatible key → Verify successful saving and immediate redirection to `/dashboard`.
