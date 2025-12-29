## 2024-05-23 - Rate Limiting Pattern
**Vulnerability:** The `/login` endpoint lacked rate limiting, allowing brute-force attacks.
**Learning:** For single-instance applications, a simple in-memory dictionary is a sufficient and effective rate limiter without adding external dependencies like Redis.
**Prevention:** Use `backend.infrastructure.security.rate_limiter.RateLimiter` on any new sensitive public endpoints.
