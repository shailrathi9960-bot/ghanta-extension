// background.js
chrome.action.onClicked.addListener((tab) => {
  // Ensure we don't inject into chrome:// or other non-http pages
  if (tab.url.startsWith("http")) {
    // Inject CSS
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content.css"]
    });

    // Inject the main content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});
