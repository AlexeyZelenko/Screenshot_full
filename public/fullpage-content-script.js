// Content script for full page screenshot with scrolling
(function() {
  console.log('Full page content script loaded');

  // Function to get page dimensions
  function getPageDimensions() {
    const body = document.body;
    const html = document.documentElement;

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    const width = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    );

    return {
      width: width,
      height: height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  // Function to scroll to position and wait for stabilization
  function scrollToPosition(x, y) {
    return new Promise((resolve) => {
      window.scrollTo(x, y);
      
      // Wait a bit for the page to stabilize after scrolling
      setTimeout(() => {
        // Check if we're at the right position
        const actualX = window.pageXOffset || document.documentElement.scrollLeft;
        const actualY = window.pageYOffset || document.documentElement.scrollTop;
        
        resolve({
          requestedX: x,
          requestedY: y,
          actualX: actualX,
          actualY: actualY
        });
      }, 100);
    });
  }

  // Function to hide fixed elements during screenshot
  function hideFixedElements() {
    const elements = document.querySelectorAll('*');
    const hiddenElements = [];
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.position === 'fixed' || style.position === 'sticky') {
        hiddenElements.push({
          element: element,
          originalDisplay: element.style.display
        });
        element.style.display = 'none';
      }
    });
    
    return hiddenElements;
  }

  // Function to restore fixed elements
  function restoreFixedElements(hiddenElements) {
    hiddenElements.forEach(item => {
      item.element.style.display = item.originalDisplay;
    });
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageDimensions') {
      const dimensions = getPageDimensions();
      console.log('Page dimensions:', dimensions);
      sendResponse(dimensions);
    } else if (request.action === 'scrollToPosition') {
      scrollToPosition(request.x, request.y).then(result => {
        console.log('Scrolled to:', result);
        sendResponse(result);
      });
    } else if (request.action === 'hideFixedElements') {
      const hiddenElements = hideFixedElements();
      console.log('Hidden fixed elements:', hiddenElements.length);
      sendResponse({ hiddenCount: hiddenElements.length });
    } else if (request.action === 'restoreFixedElements') {
      // This would need to be handled differently as we lose context
      sendResponse({ success: true });
    }
    
    return true; // Will respond asynchronously
  });

  console.log('Full page content script ready');
})(); 