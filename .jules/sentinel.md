## 2025-05-23 - [Availability] SQLite Thread Safety
**Vulnerability:** Thread-safety issues in synchronous SQLAlchemy with SQLite.
**Learning:** Default connection pooling (`QueuePool` or `SingletonThreadPool`) in SQLAlchemy with SQLite can lead to "database is locked" errors and race conditions when used in a multithreaded environment (like FastAPI threadpool).
**Prevention:** Explicitly configure `poolclass=NullPool` in `create_engine` to disable connection pooling for SQLite. This ensures each request gets a fresh connection, avoiding shared state issues across threads, albeit at a slight performance cost (acceptable for local/file-based DB).

## 2024-05-23 - DoS Prevention via Input Limits
**Vulnerability:** The login endpoint (`/login`) accepted unlimited length strings for `username` and `password`.
**Learning:** Even simple data classes like Pydantic models need explicit limits (`max_length`). Without them, they are vectors for DoS attacks (e.g., massive payloads consuming memory or CPU during hashing).
**Prevention:** Always add `max_length` constraints to string fields in API request models, especially for fields that undergo expensive processing like password hashing.
