
from playwright.sync_api import sync_playwright, expect
import json

def verify_bulk_action_bar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Debug console
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Mock API responses
        # Mock /check_health
        page.route("**/api/health", lambda route: route.fulfill(
            status=200,
            body=json.dumps({"status": "ok", "namespace": "test_namespace"})
        ))

        # Mock /api/folders
        page.route("**/api/folders", lambda route: route.fulfill(
            status=200,
            body=json.dumps([
                {"id": 1, "name": "Inbox", "unread_count": 0},
                {"id": 2, "name": "Sent", "unread_count": 0},
                {"id": 3, "name": "Trash", "unread_count": 0}
            ])
        ))

        # Mock /api/mail/1 (Inbox) with some emails
        # Removing 'Z' from timestamp to avoid invalid date error in frontend which appends 'Z'
        page.route("**/api/mail/1", lambda route: route.fulfill(
            status=200,
            body=json.dumps([
                {
                    "id": 101,
                    "sender": "sender@test.local",
                    "subject": "Test Email 1",
                    "body": "This is a test email body.",
                    "timestamp": "2023-10-26T10:00:00",
                    "is_read": False,
                    "folder_id": 1,
                    "recipients": ["me@test.local"]
                }
            ])
        ))

        page.goto("http://localhost:5173/login")

        # Inject storage
        page.evaluate("""
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({username: 'testuser', is_admin: false}));
        """)

        # Now navigate to app
        page.goto("http://localhost:5173/app/folder/1")

        # Wait for emails to load
        print("Waiting for 'Test Email 1'...")
        page.wait_for_selector("text=Test Email 1", timeout=10000)

        # Select the first email
        print("Selecting email...")
        checkbox = page.get_by_role("checkbox", name="Select message from sender@test.local")
        expect(checkbox).to_be_visible()
        checkbox.click()

        # Verify Bulk Action Bar appears
        print("Checking for Bulk Action Bar...")
        # It should have role="status" and aria-label="Bulk actions"
        bulk_bar = page.get_by_role("status", name="Bulk actions")
        expect(bulk_bar).to_be_visible()
        expect(bulk_bar).to_contain_text("1 selected")

        # Take screenshot
        page.screenshot(path="frontend/verification/bulk_action_bar.png")
        print("Verification successful! Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_bulk_action_bar()
