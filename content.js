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
  function makeDraggable() {
    let activeElement = null;
    let offsetX, offsetY;

    const onMouseDown = (e) => {
      if (e.target.classList.contains('drag-handle')) {
        activeElement = e.target.closest('.draggable-container');
        if (activeElement) {
          e.preventDefault();
          offsetX = e.clientX - activeElement.offsetLeft;
          offsetY = e.clientY - activeElement.offsetTop;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }
      }
    };

    const onMouseMove = (e) => {
      if (activeElement) {
        e.preventDefault();
        activeElement.style.left = `${e.clientX - offsetX}px`;
        activeElement.style.top = `${e.clientY - offsetY}px`;
      }
    };

    const onMouseUp = (e) => {
        if (activeElement) {
            e.preventDefault();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            activeElement = null;
        }
    };

    document.addEventListener('mousedown', onMouseDown);
  }

  makeDraggable();

  // 3. Settings and Core Logic
  const table = document.getElementById('color-scanner-table');
  const rows = table.getElementsByTagName('tr');
  const scanSelectorInput = document.getElementById('scan-selector');
  const buttonSelectorInput = document.getElementById('button-selector');
  const saveButton = document.getElementById('save-settings');

  let scanSelector = '.bet-list-item';
  let buttonSelector = '.bet-button';
  let triggered = false;

  function loadSettings() {
    const savedScanSelector = localStorage.getItem('scanSelector');
    const savedButtonSelector = localStorage.getItem('buttonSelector');
    if (savedScanSelector) {
      scanSelector = savedScanSelector;
      scanSelectorInput.value = savedScanSelector;
    }
    if (savedButtonSelector) {
      buttonSelector = savedButtonSelector;
      buttonSelectorInput.value = savedButtonSelector;
    }
  }

  function saveSettings() {
    scanSelector = scanSelectorInput.value;
    buttonSelector = buttonSelectorInput.value;
    localStorage.setItem('scanSelector', scanSelector);
    localStorage.setItem('buttonSelector', buttonSelector);
    alert('Settings saved!');
  }

  saveButton.addEventListener('click', saveSettings);
  loadSettings();

  function scanColors() {
    let greenRowCount = 0;
    try {
      const elementsToScan = document.querySelectorAll(scanSelector);
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.backgroundColor = 'white'; // Reset row color
        if (i < elementsToScan.length) {
          const computedStyle = window.getComputedStyle(elementsToScan[i]);
          const bgColor = computedStyle.backgroundColor;
          if (bgColor.startsWith('rgb(44, 182, 103)') || bgColor === 'lightgreen' || bgColor === 'green') {
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
    try {
      const betButtons = document.querySelectorAll(buttonSelector);
      betButtons.forEach(button => button.click());
      console.log('BET actions triggered!');
    } catch (e) {
      // Invalid selector, do nothing
    }
  }

  setInterval(scanColors, 1000);
})();
