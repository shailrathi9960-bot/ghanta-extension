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
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'LABEL') {
            return;
        }
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

    const handle = container.querySelector('.drag-handle') || container;
    handle.addEventListener('mousedown', onMouseDown);
  }

  const draggableContainers = document.querySelectorAll('.draggable-container');
  draggableContainers.forEach(makeDraggable);

  // 3. Settings and Core Logic
  const scanSelectorInput = document.getElementById('scan-selector');
  const saveButton = document.getElementById('save-settings');
  const colorSamplerButton = document.getElementById('color-sampler');
  const colorPreview = document.getElementById('color-preview');
  const actionButton1Container = document.getElementById('action-button-1-container');
  const actionButton2Container = document.getElementById('action-button-2-container');
  const table = document.getElementById('color-scanner-table');
  const rows = table.getElementsByTagName('tr');
  const activateScanCheckbox = document.getElementById('activate-scan-checkbox');

  let scanSelector = '.bet-list-item';
  let targetColor = 'rgb(44, 182, 103)';
  let triggered = false;
  let isSampling = false;
  let scanInterval = null;

  async function loadSettings() {
    const data = await chrome.storage.local.get(['scanSelector', 'targetColor']);
    if (data.scanSelector) {
      scanSelector = data.scanSelector;
      scanSelectorInput.value = scanSelector;
    }
    if (data.targetColor) {
      targetColor = data.targetColor;
      colorPreview.style.backgroundColor = targetColor;
    }
  }

  async function saveSettings() {
    scanSelector = scanSelectorInput.value;
    await chrome.storage.local.set({ scanSelector, targetColor });
    alert('Settings saved!');
  }

  function startColorSampling() {
    isSampling = true;
    document.body.style.cursor = 'crosshair';
    const samplingIndicator = document.createElement('div');
    samplingIndicator.id = 'sampling-indicator';
    samplingIndicator.textContent = 'Click to sample a color';
    document.body.appendChild(samplingIndicator);
  }

  function sampleColor(e) {
    if (isSampling) {
      e.preventDefault();
      e.stopPropagation();
      const element = e.target;
      const computedStyle = window.getComputedStyle(element);
      targetColor = computedStyle.backgroundColor;
      colorPreview.style.backgroundColor = targetColor;
      isSampling = false;
      document.body.style.cursor = 'default';
      const samplingIndicator = document.getElementById('sampling-indicator');
      if(samplingIndicator) {
        samplingIndicator.remove();
      }
    }
  }

  function scanColors() {
    let greenRowCount = 0;
    try {
      const elementsToScan = document.querySelectorAll(scanSelector);
      for (let i = 0; i < rows.length; i++) {
        rows[i].querySelector('td').style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        if (i < elementsToScan.length) {
          const computedStyle = window.getComputedStyle(elementsToScan[i]);
          if (computedStyle.backgroundColor === targetColor) {
            rows[i].querySelector('td').style.backgroundColor = 'lightgreen';
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
    [actionButton1Container, actionButton2Container].forEach(container => {
      container.style.display = 'none';
      const rect = container.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top + (rect.height / 2);
      const element = document.elementFromPoint(x, y);
      container.style.display = '';
      if (element) {
        element.click();
      }
    });
    console.log('Actions triggered!');
  }

  function handleScanActivation() {
    if (activateScanCheckbox.checked) {
      if (!scanInterval) {
        scanInterval = setInterval(scanColors, 1000);
      }
    } else {
      if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
        // Reset table colors when deactivated
        for (let i = 0; i < rows.length; i++) {
          rows[i].querySelector('td').style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }
      }
    }
  }

  saveButton.addEventListener('click', saveSettings);
  colorSamplerButton.addEventListener('click', startColorSampling);
  activateScanCheckbox.addEventListener('change', handleScanActivation);
  document.addEventListener('click', sampleColor, true);

  await loadSettings();

})();
