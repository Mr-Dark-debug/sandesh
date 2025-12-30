## 2024-05-24 - Rate Limiting for Email Sending
**Vulnerability:** The `/api/mail/send` endpoint lacked rate limiting, which could allow a compromised account or malicious user to send unlimited spam emails, potentially harming the server's reputation or causing resource exhaustion.
**Learning:** Authenticated endpoints also need rate limiting, not just public ones. Using the user ID (or username) as the key instead of IP address is more effective for authenticated actions as it targets the specific account being abusive regardless of their network location.
**Prevention:** Added a rate limit of 20 emails per minute per user. This can be tuned later based on usage patterns.
