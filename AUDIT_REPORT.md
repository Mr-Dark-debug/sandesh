# Sandesh Backend Audit Report

**Date:** 2024-05-22
**Auditor:** Jules (QA Engineer & Backend Auditor)
**Version:** Refactor-v1

---

## 1. Executive Summary

**Verdict:** **Architecturally Sound, Environmentally Unstable**

The Sandesh backend has been successfully refactored into a clean, modular architecture that strictly adheres to the specified non-negotiable principles. The separation of concerns between Core, Services, Infrastructure, and API is enforced correctly. However, the system failed to start in the test environment due to a persistent database connectivity issue (`sqlite3.OperationalError`) likely caused by an incompatibility between `sqlalchemy.ext.asyncio`, `greenlet`, and the sandbox filesystem/threading environment.

*   **Architecture Compliance:** ✅ **PASS** (100% compliance with Clean Architecture rules)
*   **Functional Verification:** ❌ **FAIL** (System startup failed)
*   **End-to-End Flows:** ⚠️ **Untested** (Due to startup failure)

---

## 2. Functional Test Results

| Scenario | Expected Behavior | Actual Behavior | Status |
| :--- | :--- | :--- | :--- |
| **System Startup** | Container starts, connects to DB, SMTP/API ports listen. | `sqlalchemy.exc.OperationalError: unable to open database file` even with `:memory:`. | ❌ **FAIL** |
| **Authentication** | Admin login returns JWT; invalid creds rejected. | API unavailable. | ⚠️ **BLOCKED** |
| **User Management** | Admin creates users; users get default folders. | API unavailable. | ⚠️ **BLOCKED** |
| **Sending Email** | API accepts mail, relays to SMTP, saves to Sent. | API/SMTP unavailable. | ⚠️ **BLOCKED** |
| **Receiving Email** | SMTP accepts mail, MailService saves to Inbox. | SMTP unavailable. | ⚠️ **BLOCKED** |
| **Folder Ops** | Create/List/Move folders works. | API unavailable. | ⚠️ **BLOCKED** |

*Note: Functional verification was blocked by the database driver inability to open ANY sqlite file (including memory) when running via SQLAlchemy's async engine in this environment, despite `sqlite3` and `aiosqlite` working in isolation.*

---

## 3. Architectural Audit Checklist

### Layering Rules
*   ✅ **API layer does not contain business logic.** (Verified: Routes only delegate to Services)
*   ✅ **Services do not import FastAPI or Pydantic.** (Verified: Pure Python classes)
*   ✅ **Services do not import SQLAlchemy models.** (Verified: Repositories handle Models)
*   ✅ **Repositories do not contain business rules.** (Verified: CRUD only)
*   ✅ **Core layer imports nothing from infrastructure.** (Verified: Zero imports)

### SMTP Rules
*   ✅ **SMTP server does not write to DB directly.** (Verified: Uses `MailService`)
*   ✅ **SMTP server does not create Sent copies.** (Verified: Logic is in `handle_DATA` -> `deliver_incoming_mail` which only does Inbox)
*   ✅ **SMTP server delegates to MailService.** (Verified: `MailService` instantiated per message)

### Domain Separation
*   ✅ **Domain entities are pure Python.** (Verified: Dataclasses)
*   ✅ **ORM models are isolated.** (Verified: In `infrastructure/db/models.py`)
*   ✅ **Mapping happens only in repositories.** (Verified: `_to_entity` methods in Repositories)
*   ✅ **JSON serialization is hidden from services.** (Verified: Repository handles `recipients` JSON conversion)

### Dependency Direction
*   ✅ **No circular dependencies.** (Verified: Strict direction API -> Service -> Core <- Infrastructure)

---

## 4. Known Limitations

1.  **Environment Specificity:** The current async SQLite setup (`sqlite+aiosqlite`) appears fragile in restricted environments (like the current sandbox). It may require `greenlet` version tuning or `poolclass=NullPool` (which was attempted but insufficient).
2.  **No Migrations:** The schema is hardcoded in `models.py`. Any change requires manual DDL.
3.  **Authentication persistence:** The default configuration generates a random `SECRET_KEY` on startup if not provided, invalidating tokens on restart.

---

## 5. Potential Risks

1.  **Async SQLite Stability:** SQLite is not natively async. Using `aiosqlite` with `SQLAlchemy` introduces complex threading/context switching (`greenlet`). High concurrency could lead to "database is locked" errors more easily than sync mode.
2.  **SMTP Reliability:** The SMTP server runs in the same process/container. A crash in the API or Memory leak in SMTP handler brings down the entire system.
3.  **Testing Gaps:** Due to the environmental failure, the integration of components (Service -> Repo -> DB) is not verified at runtime, only statically and via unit tests with mocks.

---

## 6. Final Verdict

**Is Sandesh ready as a local-first email system?**
**Conceptually Yes, Operationally No.** The code structure is professional and robust, suitable for a portfolio or serious project foundation. However, the runtime instability of the database layer in this environment suggests that the `aiosqlite` choice might need reconsideration or configuration tuning for the target deployment platform.

**Recommendation:**
Review the `sqlalchemy+aiosqlite` dependency chain. Consider switching to synchronous SQLite with a thread pool if async IO gains are negligible for a local-first single-user system, or ensure the target environment allows the necessary threading capabilities for `greenlet`.

**Audit Status:** **COMPLETED (with caveats)**
