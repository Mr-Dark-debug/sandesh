
import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use specific viewport to ensure visibility
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # 1. Setup LocalStorage with mock user and data
        # We need a user to bypass login
        user = {
            "id": 1,
            "username": "palette",
            "is_admin": False,
            "display_name": "Palette Artist"
        }

        # Navigate to a public page first to set localStorage
        page.goto("http://localhost:5173/login")

        page.evaluate(f"""() => {{
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify({json.dumps(user)}));
        }}""")

        # 2. Mock API responses
        # We need to mock /api/health and /api/folders to render the Layout

        page.route("**/api/health", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"status": "ok", "namespace": "test-env"})
        ))

        page.route("**/api/folders", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": 1, "name": "Inbox", "unread_count": 5},
                {"id": 2, "name": "Sent", "unread_count": 0},
                {"id": 3, "name": "Drafts", "unread_count": 2},
                {"id": 4, "name": "Trash", "unread_count": 0}
            ])
        ))

        # Mock /api/mail/1 (Inbox) to avoid errors when landing on default route
        page.route("**/api/mail/*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([])
        ))

        # 3. Navigate to App
        page.goto("http://localhost:5173/app")

        # 4. Wait for Layout to load
        # Check for the sidebar elements
        page.wait_for_selector("text=Inbox")

        # 5. Verify Unread Badge
        # We expect "5" to be in a badge.
        # The badge has classes 'bg-[#D8A48F]' and 'text-white'
        # We can try to take a screenshot of the sidebar

        # Wait a bit for animations
        page.wait_for_timeout(1000)

        # 6. Verify Search Bar
        # Check if search input is disabled
        search_input = page.get_by_placeholder("Search (Coming soon)")
        if not search_input.is_disabled():
            print("Error: Search input is not disabled")

        # Take screenshot
        page.screenshot(path=".jules-verification/layout_verification.png")
        print("Screenshot saved to .jules-verification/layout_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
