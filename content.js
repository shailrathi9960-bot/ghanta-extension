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

  // 3. Color scanning and button trigger logic
  const table = document.getElementById('color-scanner-table');
  const rows = table.getElementsByTagName('tr');
  let triggered = false;

  function scanColors() {
    let greenRowCount = 0;
    // Targeting the bet history list from the screenshot
    const elementsToScan = document.querySelectorAll('.bet-list-item');

    for (let i = 0; i < rows.length; i++) {
      if (i < elementsToScan.length) {
        const computedStyle = window.getComputedStyle(elementsToScan[i]);
        const bgColor = computedStyle.backgroundColor;

        if (bgColor.startsWith('rgb(44, 182, 103)')) { // Green color from the screenshot
          rows[i].style.backgroundColor = 'lightgreen';
          greenRowCount++;
        } else {
          rows[i].style.backgroundColor = 'white';
        }
      }
    }

    if (greenRowCount >= 3 && !triggered) {
      triggerActions();
      triggered = true;
    } else if (greenRowCount < 3 && triggered) {
      triggered = false; // Reset the trigger
    }
  }

  function triggerActions() {
    // Targeting the bet buttons from the screenshot
    const betButtons = document.querySelectorAll('.bet-button');
    betButtons.forEach(button => button.click());
    console.log('BET actions triggered!');
  }

  setInterval(scanColors, 1000);
})();
