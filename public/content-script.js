let isSelecting = false;
let startX, startY, endX, endY;
let overlay, selectionBox;

// Create overlay
function createOverlay() {
  overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999999;
    cursor: crosshair;
  `;
  
  selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px solid #007bff;
    background: rgba(0, 123, 255, 0.1);
    display: none;
  `;
  
  overlay.appendChild(selectionBox);
  
  // Instructions
  const instructions = document.createElement('div');
  instructions.textContent = 'Drag to select area. Press ESC to cancel.';
  instructions.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 1000000;
  `;
  
  overlay.appendChild(instructions);
  document.body.appendChild(overlay);
  
  // Event listeners
  overlay.addEventListener('mousedown', startSelection);
  document.addEventListener('mousemove', updateSelection);
  document.addEventListener('mouseup', endSelection);
  document.addEventListener('keydown', handleKeyDown);
}

function startSelection(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  selectionBox.style.display = 'block';
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
}

function updateSelection(e) {
  if (!isSelecting) return;
  
  endX = e.clientX;
  endY = e.clientY;
  
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function endSelection(e) {
  if (!isSelecting) return;
  
  isSelecting = false;
  endX = e.clientX;
  endY = e.clientY;
  
  const rect = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };
  
  // Send coordinates to background script
  chrome.runtime.sendMessage({
    action: 'captureSelectedArea',
    rect: rect
  }, (response) => {
    // Show success/error notification
    showNotification(response && response.success ? 'Screenshot captured!' : 'Failed to capture screenshot');
  });
  
  cleanup();
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    cleanup();
  }
}

function cleanup() {
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
    selectionBox = null;
  }
  document.removeEventListener('mousemove', updateSelection);
  document.removeEventListener('mouseup', endSelection);
  document.removeEventListener('keydown', handleKeyDown);
  isSelecting = false;
}

// Show notification to user
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${message.includes('captured') ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation keyframes
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Start area selection when content script is injected
createOverlay(); 