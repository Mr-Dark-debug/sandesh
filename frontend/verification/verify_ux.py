
import json
from playwright.sync_api import sync_playwright, expect

def verify_ux_improvements(page):
    # Inject auth token to bypass login
    page.goto("http://localhost:5173/login")

    # Mock user and token
    user_data = {
        "id": 1,
        "username": "admin",
        "is_admin": True,
        "display_name": "Admin User"
    }

    page.evaluate(f"""() => {{
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({json.dumps(user_data)}));
    }}""")

    # --- Verify 1: Toast Close Button ARIA Label ---
    print("Verifying Toast Close Button...")
    # Trigger a toast by navigating to a protected route
    page.goto("http://localhost:5173/app/compose")

    # Trigger a toast (e.g. by clicking a "Coming Soon" button)
    # Force click because it has aria-disabled="true"
    page.get_by_role("button", name="Attach files (Coming soon)").click(force=True)

    # Find the toast close button
    # It should have aria-label="Close" now
    close_button = page.locator("div[role='status'] button[aria-label='Close']")
    expect(close_button).to_be_visible()
    print("✅ Toast close button has aria-label='Close'")

    # --- Verify 3: Compose Send Button ARIA Label ---
    print("Verifying Compose Send Button...")
    # Fill out the form to enable the Send button
    page.fill("#to-input", "test@local")
    page.fill("#subject-input", "Test Subject")
    page.fill("textarea[aria-label='Message body']", "Test Body")

    # Check the button exists and has initial label "Send" (via text content)
    send_btn = page.get_by_role("button", name="Send")
    expect(send_btn).to_be_visible()

    # Verify the button has the default aria-label "Send" when not loading
    # The code is: aria-label={sending ? "Sending..." : "Send"}
    # So initially it should be "Send"
    expect(send_btn).to_have_attribute("aria-label", "Send")
    print("✅ Send button has correct initial aria-label")

    page.screenshot(path="frontend/verification/compose_ux.png")
    print("📸 Screenshot taken at frontend/verification/compose_ux.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to standard desktop size
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            verify_ux_improvements(page)
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            page.screenshot(path="frontend/verification/error.png")
            raise e
        finally:
            browser.close()
