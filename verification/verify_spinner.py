from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_login_spinner(page: Page):
    # Navigate to login
    page.goto("http://localhost:5173/login")

    # Fill in dummy credentials
    page.get_by_label("Username").fill("testuser")
    # Use ID for password to avoid ambiguity
    page.locator("#password").fill("password")

    # Intercept the login API call to make it slow so we can see the spinner
    def handle_route(route):
        time.sleep(2) # Delay to capture spinner
        route.abort() # We don't need it to succeed

    page.route("**/api/auth/token", handle_route)

    # Click sign in
    page.get_by_role("button", name="Sign in").click()

    # Wait a bit for the spinner to appear
    time.sleep(0.5)

    # Screenshot
    page.screenshot(path="/home/jules/verification/login_spinner.png")
    print("Screenshot saved to /home/jules/verification/login_spinner.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_login_spinner(page)
        finally:
            browser.close()
