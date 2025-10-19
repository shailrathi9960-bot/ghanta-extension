(async () => {
  // 1. Inject HTML and CSS
  const container = document.createElement('div');
  container.innerHTML = await fetch(chrome.runtime.getURL('content.html')).then(r => r.text());
  document.body.appendChild(container);

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('content.css');
  document.head.appendChild(style);

  // 2. Make the UI draggable
  const dragHandle = document.getElementById('drag-handle');
  const containerElement = document.getElementById('color-scanner-container');
  let isDragging = false;
  let offsetX, offsetY;

  dragHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - containerElement.offsetLeft;
    offsetY = e.clientY - containerElement.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      containerElement.style.left = `${e.clientX - offsetX}px`;
      containerElement.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // 3. Color scanning and button trigger logic
  const table = document.getElementById('color-scanner-table');
  const rows = table.getElementsByTagName('tr');
  const button1 = document.getElementById('action-button-1');
  const button2 = document.getElementById('action-button-2');
  let triggered = false;

  function scanColors() {
    let greenRowCount = 0;
    const elementsToScan = document.querySelectorAll('div'); // Scan all divs

    for (let i = 0; i < rows.length; i++) {
      if (i < elementsToScan.length) {
        const computedStyle = window.getComputedStyle(elementsToScan[i]);
        const bgColor = computedStyle.backgroundColor;

        // Check for shades of green
        if (bgColor.startsWith('rgb(144, 238, 144)') || bgColor === 'lightgreen' || bgColor === 'green' || bgColor.startsWith('rgb(0, 128, 0)')) {
          rows[i].style.backgroundColor = 'lightgreen';
          greenRowCount++;
        } else {
          rows[i].style.backgroundColor = 'white';
        }
      }
    }

    if (greenRowCount >= 3 && !triggered) {
      triggerActions();
      triggered = true; // Ensure it only triggers once
    }
  }

  function triggerActions() {
    button1.style.backgroundColor = 'red';
    button1.textContent = 'Triggered!';
    button2.style.backgroundColor = 'red';
    button2.textContent = 'Triggered!';
    console.log('Actions triggered!');
  }

  setInterval(scanColors, 1000); // Scan every second
})();
