
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_caps_lock_warning(page: Page):
    # 1. Arrange: Go to the Login page.
    page.goto("http://localhost:5173/login")

    # 2. Act: Find the password field.
    password_input = page.get_by_placeholder("Enter your password")
    expect(password_input).to_be_visible()

    # 3. Simulate Caps Lock interaction using evaluate.
    # The previous attempt failed with Illegal invocation likely because getModifierState
    # needs to be called on a trusted event or properly mocked on the prototype in a way
    # that doesn't break internal bindings.
    #
    # A simpler approach: Dispatch an event that we create, and on that specific event object,
    # we override the method before dispatching it.

    page.evaluate("""
        const input = document.getElementById('password');
        const event = new KeyboardEvent('keydown', {
            key: 'a',
            bubbles: true
        });

        // Directly override the method on the instance
        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'CapsLock'
        });

        input.dispatchEvent(event);
    """)

    # 4. Assert: Check if the warning is visible.
    warning_text = page.get_by_text("Caps Lock is on")
    expect(warning_text).to_be_visible()

    # 5. Screenshot
    page.screenshot(path="/home/jules/verification/caps-lock-warning.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            verify_caps_lock_warning(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                page.screenshot(path="/home/jules/verification/failure.png")
            except:
                pass
        finally:
            browser.close()
