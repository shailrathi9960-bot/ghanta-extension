
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    extension_path = os.path.abspath('.')
    user_data_dir = '/tmp/test-user-data-dir'

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir,
            headless=True,
            channel='chromium',
            args=[
                f'--disable-extensions-except={extension_path}',
                f'--load-extension={extension_path}',
            ]
        )

        # A more robust way to find the service worker.
        # Check if it already exists, otherwise wait for it.
        service_worker = None
        if context.service_workers:
            service_worker = context.service_workers[0]
            print("Found an existing service worker.")
        else:
            try:
                # Increase timeout to give the extension more time to initialize
                service_worker = await context.wait_for_event('serviceworker', timeout=10000)
                print("Waited for and found the service worker.")
            except Exception as e:
                print("Timeout: Could not find the service worker. Check the manifest file.")
                await context.close()
                raise e

        if not service_worker:
            raise Exception("Service worker could not be initialized.")

        # Create a new page to inject the UI into
        page = await context.new_page()
        # Using about:blank is a stable target for testing injection
        await page.goto("about:blank")
        print(f"Navigated to a blank page for testing.")

        # Programmatically inject the scripts using the service worker
        await service_worker.evaluate(
            """
            async () => {
                const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                if (tab && tab.id) {
                    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content.css"] });
                    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
                } else {
                    console.error("No active tab found for script injection.");
                }
            }
            """
        )
        print("Injection script executed via service worker.")

        # Wait for the UI to be injected
        await page.wait_for_selector('#color-scanner-container')
        print("UI container successfully found on the page.")

        # Find and interact with the "Activate Scan" checkbox
        activate_scan_checkbox = await page.query_selector('#activate-scan-checkbox')
        if not activate_scan_checkbox:
            raise AssertionError("The 'Activate Scan' checkbox was not found.")

        await activate_scan_checkbox.check()
        print("Checked the 'Activate Scan' checkbox.")

        await page.wait_for_timeout(500)

        # Take a screenshot for visual verification
        screenshot_path = 'jules-scratch/verification/verification.png'
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved successfully to {screenshot_path}")

        await context.close()

if __name__ == '__main__':
    asyncio.run(main())
