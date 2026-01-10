from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to every response.

    Headers added:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Referrer-Policy: strict-origin-when-cross-origin
    - Content-Security-Policy: ...
    - Permissions-Policy: ...
    - Strict-Transport-Security: ...
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        # Prevent MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS filtering (mostly legacy, but good defense in depth)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Strict Transport Security (HSTS)
        # 1 year = 31536000 seconds
        # Note: Browsers only respect this over HTTPS, but it's best practice to include it.
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Permissions Policy (formerly Feature Policy)
        # Disable sensitive features that this email app doesn't need
        # Note: Using implicit string concatenation (no commas)
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=()"
        )

        # Content Security Policy (CSP)
        # 🛡️ Sentinel: Enhanced CSP for better security while allowing React/Vite to function.
        # - default-src 'self': Only load resources from own origin
        # - img-src 'self' data:: Allow images from own origin and data URIs (avatars, etc.)
        # - script-src 'self' 'unsafe-inline': Allow scripts from own origin and inline (needed for Vite/React dev)
        # - style-src 'self' 'unsafe-inline': Allow styles from own origin and inline (needed for styled-components/Tailwind)
        # - object-src 'none': Block <object>, <embed>, <applet>
        # - base-uri 'self': Prevent <base> tag hijacking
        # - frame-ancestors 'none': Prevent embedding in iframes (Clickjacking protection)
        if "Content-Security-Policy" not in response.headers:
            csp = (
                "default-src 'self'; "
                "img-src 'self' data:; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "frame-ancestors 'none';"
            )
            response.headers["Content-Security-Policy"] = csp

        return response
