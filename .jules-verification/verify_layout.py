from playwright.sync_api import sync_playwright, expect
import time

def verify_folder_view():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a defined viewport to prevent visibility issues
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # 1. Login
        # Inject user token and object into localStorage to bypass login screen
        # Using the admin user defined in environment variables or default
        user = '{"id": 1, "username": "admin", "is_admin": true, "display_name": "Admin User", "token": "fake-token"}'

        # Navigate to a public page first to set localStorage
        page.goto("http://localhost:5173/login")

        page.evaluate(f"localStorage.setItem('user', '{user}')")
        page.evaluate("localStorage.setItem('token', 'fake-token')")

        # 2. Go to Inbox
        # We assume the user is logged in now
        page.goto("http://localhost:5173/app/folder/1")

        # Mock API response for folders since we can't easily auth with backend in this script
        # without real token. But wait, we need real integration?
        # The script failed because "Inbox" link wasn't found. This means folders weren't loaded.
        # If backend rejects "fake-token", then folders won't load.

        # Strategy: Mock the /api/folders response to verify Frontend behavior independent of Backend Auth
        page.route("**/api/folders", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": 1, "name": "Inbox", "unread_count": 2, "user_id": 1}, {"id": 2, "name": "Sent", "unread_count": 0, "user_id": 1}]'
        ))

        page.route("**/api/health", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"status": "ok", "namespace": "local"}'
        ))

        page.route("**/api/mail/1", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # Reload page to trigger mock
        page.reload()

        # 3. Wait for folder list to load
        # The 'Inbox' link in the sidebar should be visible
        inbox_link = page.get_by_role("link", name="Inbox")
        expect(inbox_link).to_be_visible(timeout=10000)

        # 4. Verify Layout elements
        # Check if the Sidebar is present
        sidebar = page.locator("aside")
        expect(sidebar).to_be_visible()

        # Check if "Compose" button is present in the sidebar
        # Using specific class or hierarchy to distinguish from empty state button
        compose_btn = page.locator("aside button").filter(has_text="Compose")
        expect(compose_btn).to_be_visible()

        # 5. Take screenshot
        # This confirms the layout is rendering correctly with the optimization
        page.screenshot(path=".jules-verification/verification.png")
        print("Screenshot saved to .jules-verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_folder_view()
