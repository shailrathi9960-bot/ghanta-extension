# Color Scanner Chrome Extension

This extension provides an on-page interface to scan elements for a specific color and trigger actions based on the scan results.

## Features

*   **Draggable UI:** All components (scan table, action buttons, settings panel) can be moved freely around the page.
*   **Configurable Scanner:**
    *   **CSS Selector:** Specify which elements on the page to scan (e.g., `.history-item`).
    *   **Color Sampler:** Don't guess the color. Use the "Sample Color" tool to click on any element and teach the extension the exact color to look for.
*   **Coordinate-Based Actions:** The two circular action buttons are also draggable. When the scan condition is met (3 or more items match the target color), the extension will trigger a click at the center of wherever you have placed these buttons.

## How to Use

1.  **Activate:** Click the extension icon in the Chrome toolbar to inject the UI onto the current page.
2.  **Configure:**
    *   Drag the "Settings" panel to a convenient location.
    *   Enter a CSS selector for the items you want to scan.
    *   Click "Sample Color". Your cursor will turn into a crosshair. Click on an element on the page that has the color you want to target. The color preview will update.
    *   Click "Save".
3.  **Position Actions:** Drag the two circular action buttons and place them directly over the elements you want to be clicked (e.g., over the "BET" buttons in a game).
4.  **Monitor:** The 1x10 scan table will update in real-time. When three or more scanned elements match the target color, the corresponding rows will turn light green, and the clicks will be triggered.
