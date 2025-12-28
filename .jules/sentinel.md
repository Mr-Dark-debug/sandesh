## 2025-05-23 - [Availability] SQLite Thread Safety
**Vulnerability:** Thread-safety issues in synchronous SQLAlchemy with SQLite.
**Learning:** Default connection pooling (`QueuePool` or `SingletonThreadPool`) in SQLAlchemy with SQLite can lead to "database is locked" errors and race conditions when used in a multithreaded environment (like FastAPI threadpool).
**Prevention:** Explicitly configure `poolclass=NullPool` in `create_engine` to disable connection pooling for SQLite. This ensures each request gets a fresh connection, avoiding shared state issues across threads, albeit at a slight performance cost (acceptable for local/file-based DB).

## 2024-05-23 - DoS Prevention via Input Limits
**Vulnerability:** The login endpoint (`/login`) accepted unlimited length strings for `username` and `password`.
**Learning:** Even simple data classes like Pydantic models need explicit limits (`max_length`). Without them, they are vectors for DoS attacks (e.g., massive payloads consuming memory or CPU during hashing).
**Prevention:** Always add `max_length` constraints to string fields in API request models, especially for fields that undergo expensive processing like password hashing.

## 2025-05-24 - [Security] Insecure CORS Configuration
**Vulnerability:** The application was configured with `allow_origins=["*"]` AND `allow_credentials=True`. This is an invalid configuration that many frameworks (including Starlette/FastAPI) resolve by reflecting the request origin, effectively allowing ANY site to make credentialed requests to the API (CSRF risk).
**Learning:** Never combine wildcard origins with credentials. If you need credentials (cookies/auth headers) in cross-origin requests, you must specify exact allowed origins. Using `allow_credentials=False` is safer for token-based APIs that don't rely on cookies.
**Prevention:** Set `allow_credentials=False` for APIs using Bearer tokens, which allows safely using `allow_origins=["*"]` for maximum availability without CSRF risks.
