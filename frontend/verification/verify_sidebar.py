
from playwright.sync_api import sync_playwright, expect
import json

def verify_sidebar(page):
    # Set local storage items to simulate logged in user
    page.goto("http://localhost:5173/login")

    user = {
        "id": 1,
        "username": "admin",
        "email": "admin@local",
        "is_admin": True,
        "display_name": "Administrator"
    }

    # Inject token and user into localStorage
    page.evaluate(f"""() => {{
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({json.dumps(user)}));
    }}""")

    # Navigate to app
    page.goto("http://localhost:5173/app/inbox")

    # Wait for sidebar to be visible (desktop default is open)
    sidebar = page.locator("aside")
    expect(sidebar).to_be_visible()

    # Verify sidebar width is 280px (approx)
    box = sidebar.bounding_box()
    print(f"Initial Sidebar Width: {box['width']}")
    assert box['width'] > 200, "Sidebar should be open initially"

    # Take screenshot of open sidebar
    page.screenshot(path="frontend/verification/sidebar_open.png")

    # Click toggle button
    # The toggle button is the one in the header
    toggle_btn = page.locator("header button[aria-label='Collapse sidebar']")
    if not toggle_btn.is_visible():
        toggle_btn = page.locator("header button[aria-label='Expand sidebar']")

    expect(toggle_btn).to_be_visible()
    toggle_btn.click()

    # Wait for transition - wait a bit for animation
    page.wait_for_timeout(500)

    # Verify sidebar is collapsed (width should be 0 or hidden)
    # Note: locator might still be attached but size 0
    box_closed = sidebar.bounding_box()
    print(f"Closed Sidebar Width: {box_closed['width']}")
    assert box_closed['width'] < 10, "Sidebar should be collapsed"

    # Take screenshot of collapsed sidebar
    page.screenshot(path="frontend/verification/sidebar_collapsed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Use a fixed viewport to ensure desktop mode
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            verify_sidebar(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="frontend/verification/error.png")
        finally:
            browser.close()
