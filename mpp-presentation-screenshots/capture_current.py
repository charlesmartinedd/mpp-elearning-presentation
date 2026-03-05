from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto("file:///C:/Users/MarieLexisDad/Downloads/module-1-do-w-mentor-protege-program-raw/content/index.html", wait_until="domcontentloaded")
    page.wait_for_timeout(5000)
    page.screenshot(path="C:/Users/MarieLexisDad/Documents/Obsidian Vault/tmp/mpp-presentation-screenshots/cover-screen.png")
    print("Captured cover screen")
    browser.close()
