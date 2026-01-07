
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright, expect

# Add project root to path for imports if needed
sys.path.append(os.getcwd())

def verify_compose_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Inject auth token to bypass login
        # We need to navigate to the origin first to set local storage
        page.goto("http://localhost:5173/")

        user_data = {
            "id": 1,
            "username": "admin",
            "email": "admin@local",
            "is_admin": True
        }

        page.evaluate(f"""() => {{
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({json.dumps(user_data)}));
        }}""")

        # Navigate to Compose page
        print("Navigating to Compose page...")
        page.goto("http://localhost:5173/app/compose")

        # Wait for page to load
        page.wait_for_load_state('networkidle')

        # 1. Verify Maximize Icon
        print("Verifying Minimize/Maximize icon...")
        # Minimize the window
        minimize_btn = page.get_by_label("Minimize")
        minimize_btn.click()

        # Check if the icon changed (we can check the button title/label change as proxy or visual)
        # The code changes label to "Expand" when minimized
        expand_btn = page.get_by_label("Expand")
        expect(expand_btn).to_be_visible()

        # Take screenshot of minimized state
        page.screenshot(path="frontend/verification/compose_minimized.png")
        print("Screenshot saved: frontend/verification/compose_minimized.png")

        # Expand again
        expand_btn.click()
        expect(page.get_by_label("Minimize")).to_be_visible()

        # 2. Verify Sending State
        print("Verifying Sending state...")

        # Fill form
        page.locator("#to-input").fill("test@local")
        page.locator("#subject-input").fill("Test Email")
        page.get_by_label("Message body").fill("This is a test email.")

        # Container for the route to manually fulfill later
        pending_routes = []

        def handle_route(route):
            print("Intercepted send request...")
            pending_routes.append(route)
            # Do not fulfill yet!

        # Mock the API
        page.route("**/api/mail/send", handle_route)

        # Click send
        send_btn = page.get_by_role("button", name="Send")
        send_btn.click()

        # Now the request is hanging. The UI should show "Sending..."

        # Verify "Sending..." text appears
        sending_indicator = page.get_by_text("Sending...")
        expect(sending_indicator).to_be_visible()

        # Take screenshot of sending state
        page.screenshot(path="frontend/verification/compose_sending.png")
        print("Screenshot saved: frontend/verification/compose_sending.png")

        # Now fulfill the request
        if pending_routes:
            print("Fulfilling request...")
            pending_routes[0].fulfill(status=200, body=json.dumps({"message": "Sent"}))
        else:
            print("Warning: No route intercepted!")

        browser.close()

if __name__ == "__main__":
    verify_compose_ux()
