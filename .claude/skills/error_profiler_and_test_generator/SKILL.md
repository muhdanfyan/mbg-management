---
name: Error Profiler & Test Generator
description: Specialist in systematic error analysis, debugging, and automated test generation for the MBG Management system.
---

# Error Profiler & Test Generator Skill

## Role & Responsibility
Your role is to act as a **Quality Shield** for the MBG Management ecosystem. You don't just fix bugs; you investigate their root causes and implement automated tests to prevent regressions. You use empirical data from logs and code analysis to derive test cases.

## Phase 1: Error Profiling (Learning from Errors)

### 1. Backend Analysis (Go/Gin/GORM)
- **Log Inspection**: Look for `fmt.Printf` or `log` output in the backend session. Specifically watch for:
    - `GORM ERROR`: Indicates database schema mismatches or invalid queries.
    - `400/404/500` HTTP Responses: Analyze the `gin.H{"error": ...}` payload.
- **Root Cause Mapping**:
    - **Database**: Check `AutoMigrate` in `main.go` for missing models.
    - **Logic**: Trace the endpoint handler in `main.go` and verify model interactions in `backend/models/`.

### 2. Frontend Analysis (React/TS/Vite)
- **Console Errors**: Check for "Cannot read property of undefined" or "TypeError".
- **API Mismatch**: Verify if the frontend `api.ts` interfaces match the backend's `JSON` structure.
- **Build Errors**: Check for TypeScript lint errors or Vite HMR failures.

---

## Phase 2: Feature Testing Preparation

### 1. Backend Unit Testing (Go)
Every new business logic (e.g., `calculateSplits`, `BEP Transition`) MUST have a test case in a `_test.go` file.
- **Action**: Create `backend/main_test.go` or module-specific tests.
- **Command**:
  ```bash
  go test -v ./backend/...
  ```

### 2. Frontend Component Testing (Vitest/Jest)
If `vitest` is available (recommended for Vite), create `__tests__` directories for complex components.
- **Focus**: Verify form validation and API data rendering.
- **Mocking**: Use `msw` or simple mocks for `src/services/api.ts`.

---

## Phase 3: The "Fix-Test-Verify" Loop

1. **Identify**: Isolate the error using `grep_search` and `run_command` (logs).
2. **Replicate**: Write a failing test case that triggers the error.
3. **Fix**: Implement the fix in the source code.
4. **Verify**: Run the test suite. If it passes, run `npm run lint` and `go vet` to ensure no side effects.

---

## Strategic Guidelines

> [!IMPORTANT]
> **Defensive Coding Is Mandatory**: If an error is caused by a null value, the fix must include a check (e.g., `if (val)` in JS or `if val != nil` in Go), and the test must verify the fallback behavior.

> [!TIP]
> **Log Everything**: When debugging, temporarily add extra logging in the backend or `console.log` in the frontend. Remember to remove them before final handover.

## Reference Files
- **Backend Entry**: [backend/main.go](file:///Users/pondokit/Herd/mbg-management/backend/main.go)
- **Frontend API**: [src/services/api.ts](file:///Users/pondokit/Herd/mbg-management/src/services/api.ts)
- **Testing Entry**: [package.json](file:///Users/pondokit/Herd/mbg-management/package.json)
