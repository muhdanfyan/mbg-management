---
name: Project Testing Expert
description: Specialist in functional and integration testing for the MBG Management system, mapping frontend routes to backend endpoints.
---

# Project Testing Expert Skill

## Role & Responsibility
Your mission is to ensure the functional integrity of the MBG Management system. You use the project's internal mapping to verify that frontend components correctly interact with backend API endpoints and that all CRUD operations work as expected.

## Core Project Mapping

| Feature / Page | Frontend File | Backend Endpoints | Primary Data Model |
| :--- | :--- | :--- | :--- |
| **Authentication** | [Login.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Login.tsx) | `POST /api/auth/login` | `User` |
| **Dashboard** | [Dashboard.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Dashboard.tsx) | `GET /api/dashboard/summary` | N/A (Summary) |
| **Locations** | [Locations.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Locations.tsx) | `/api/kitchens`, `/api/routes` | `Dapur`, `Route` |
| **Construction**| [Construction.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Construction.tsx) | `/api/contracts`, `/api/progress-updates` | `Contract`, `ProgressUpdate` |
| **Procurement** | [Procurement.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Procurement.tsx) | `/api/equipment`, `/api/purchase-orders` | `Equipment`, `PurchaseOrder` |
| **HR** | [HR.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/HR.tsx) | `/api/employees`, `/api/vacancies` | `Employee`, `Vacancy` |
| **Finance** | [Finance.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Finance.tsx) | `/api/transactions`, `/api/loans`, `/api/dapur/:id/report` | `Transaction`, `Loan` |
| **User Management** | [Users.tsx](file:///Users/pondokit/Herd/mbg-management/src/pages/Users.tsx) | `/api/users` | `User` |

## Strategic Guidelines

### 1. Verification Checklist
- **Create**: Verify that "Add" modals correctly send data and trigger a list refresh.
- **Read**: Ensure page loads without crashes (defensive check for `toLocaleString`, `replace`, etc.).
- **Update**: Verify that "Edit" modals pre-populate correctly and save changes.
- **Delete**: Confirm that deletion triggers a confirmation dialog and removes the entry from the UI.

### 2. Common Pitfalls to Test
- **Undefined Values**: Check for missing fields in backend responses that might crash the UI (`contract.total_value`, `contract.payment_status`).
- **Data Types**: Ensure numeric IDs and values are correctly parsed (Int/Float) before sending to the backend.
- **Role Restrictions**: Verify that non-Admin users cannot see sensitive pages like `User Management`.

## Reference Files
- **Backend Routes**: [main.go](file:///Users/pondokit/Herd/mbg-management/backend/main.go)
- **API Client**: [api.ts](file:///Users/pondokit/Herd/mbg-management/src/services/api.ts)
- **Data Models**: [backend/models/](file:///Users/pondokit/Herd/mbg-management/backend/models/)
- **User Credentials**: [user_credentials_reference.md](file:///Users/pondokit/Herd/mbg-management/.agents/skills/user_credentials_reference.md)
