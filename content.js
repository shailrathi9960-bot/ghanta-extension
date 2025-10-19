(async () => {
  // 1. Inject HTML and CSS
  const response = await fetch(chrome.runtime.getURL('content.html'));
  const html = await response.text();
  document.body.insertAdjacentHTML('beforeend', html);

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('content.css');
  document.head.appendChild(style);

  // 2. Make the UIs draggable
  function makeDraggable(container) {
      let isDragging = false;
      let offsetX, offsetY;

      const onMouseDown = (e) => {
          isDragging = true;
          offsetX = e.clientX - container.offsetLeft;
          offsetY = e.clientY - container.offsetTop;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (e) => {
          if (isDragging) {
              container.style.left = `${e.clientX - offsetX}px`;
              container.style.top = `${e.clientY - offsetY}px`;
          }
      };

      const onMouseUp = () => {
          isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };

      // Use the button itself as the drag handle for the minimal buttons
      const handle = container.querySelector('button');
      if (handle && (container.id === 'action-button-1-container' || container.id === 'action-button-2-container')) {
          handle.addEventListener('mousedown', onMouseDown);
      } else {
        // Use the generic drag handle for other containers
        const genericHandle = container.querySelector('.drag-handle');
        if(genericHandle) {
          genericHandle.addEventListener('mousedown', onMouseDown);
        }
      }
  }

  const draggableContainers = document.querySelectorAll('.draggable-container');
  draggableContainers.forEach(makeDraggable);


  // 3. Settings and Core Logic
  const table = document.getElementById('color-scanner-table');
  const rows = table.getElementsByTagName('tr');
  const scanSelectorInput = document.getElementById('scan-selector');
  const saveButton = document.getElementById('save-settings');
  const actionButton1Container = document.getElementById('action-button-1-container');
  const actionButton2Container = document.getElementById('action-button-2-container');

  let scanSelector = '.bet-list-item';
  let triggered = false;

  function loadSettings() {
    const savedScanSelector = localStorage.getItem('scanSelector');
    if (savedScanSelector) {
      scanSelector = savedScanSelector;
      scanSelectorInput.value = savedScanSelector;
    }
  }

  function saveSettings() {
    scanSelector = scanSelectorInput.value;
    localStorage.setItem('scanSelector', scanSelector);
    alert('Settings saved!');
  }

  saveButton.addEventListener('click', saveSettings);
  loadSettings();

  function isGreen(color) {
    if (!color || !color.startsWith('rgb')) return false;
    try {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        return g > r && g > b;
    } catch (e) {
        return false;
    }
  }

  function scanColors() {
    let greenRowCount = 0;
    try {
      const elementsToScan = document.querySelectorAll(scanSelector);
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // Reset row color
        if (i < elementsToScan.length) {
          const computedStyle = window.getComputedStyle(elementsToScan[i]);
          const bgColor = computedStyle.backgroundColor;
          if (isGreen(bgColor)) {
            rows[i].style.backgroundColor = 'lightgreen';
            greenRowCount++;
          }
        }
      }
    } catch (e) {
      // Invalid selector, do nothing
    }

    if (greenRowCount >= 3 && !triggered) {
      triggerActions();
      triggered = true;
    } else if (greenRowCount < 3 && triggered) {
      triggered = false;
    }
  }

  function triggerActions() {
    [actionButton1Container, actionButton2Container].forEach(buttonContainer => {
      // Hide our UI to not interfere with the click
      buttonContainer.style.display = 'none';

      const rect = buttonContainer.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top + (rect.height / 2);

      const elementToClick = document.elementFromPoint(x, y);

      // Show our UI again
      buttonContainer.style.display = '';

      if (elementToClick) {
        elementToClick.click();
      }
    });
    console.log('BET actions triggered at coordinates!');
  }

  setInterval(scanColors, 1000);
})();
