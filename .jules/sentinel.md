## 2024-03-24 - Enhanced Security Headers
**Vulnerability:** Weak HTTP security headers (specifically basic CSP and missing Permissions-Policy).
**Learning:** `Permissions-Policy` header construction in Python requires careful string handling; using a tuple with commas `('a', 'b')` results in an invalid header value. Implicit string concatenation `('a' 'b')` must be used instead.
**Prevention:** Verify header values in tests to ensure they are strings, not string representations of tuples.
