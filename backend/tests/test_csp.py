from fastapi.testclient import TestClient
from backend.main import app

def test_security_headers():
    client = TestClient(app)
    response = client.get("/api/health")

    assert response.status_code == 200

    headers = response.headers

    # Check for CSP
    assert "content-security-policy" in headers
    csp = headers["content-security-policy"]

    # Check critical directives
    assert "default-src 'self'" in csp
    assert "script-src 'self' 'unsafe-inline'" in csp
    assert "object-src 'none'" in csp
    assert "frame-ancestors 'none'" in csp

    # Check other security headers
    assert headers["x-content-type-options"] == "nosniff"
    assert headers["x-frame-options"] == "DENY"
    assert headers["x-xss-protection"] == "1; mode=block"
    assert headers["referrer-policy"] == "strict-origin-when-cross-origin"
