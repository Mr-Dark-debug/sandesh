
import os
import sys
from playwright.sync_api import sync_playwright

def verify_coming_soon(page):
    page.goto("http://localhost:5173/welcome")

    # Inject mock token
    page.evaluate("localStorage.setItem('token', 'mock_token')")
    page.evaluate("localStorage.setItem('user', JSON.stringify({username: 'test', is_admin: false}))")

    # Go to Compose page directly
    page.goto("http://localhost:5173/app/compose")

    # Wait for page load
    page.wait_for_selector('button[title*="Coming soon"]')

    # Find a Coming Soon button
    button = page.locator('button[title*="Coming soon"]').first

    # Click it (force=True to bypass Playwright's checks if it thinks it's disabled)
    button.click(force=True)

    # Wait for toast
    toast = page.get_by_role("status").last
    toast.wait_for(state="visible")

    # Take screenshot
    page.screenshot(path="frontend/verification/coming_soon_toast.png")

    print("Verification successful: Toast appeared!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            verify_coming_soon(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                page.screenshot(path="frontend/verification/error.png")
            except:
                pass
            sys.exit(1)
        finally:
            browser.close()
