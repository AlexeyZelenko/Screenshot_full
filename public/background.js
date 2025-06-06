// Listen for commands from keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'take-screenshot') {
    captureVisibleTab();
  } else if (command === 'take-full-screenshot') {
    captureFullPage();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'captureVisibleTab') {
    captureVisibleTab().then(() => {
      sendResponse({success: true});
    }).catch(error => {
      console.error('Error capturing visible tab:', error);
      sendResponse({success: false, error: error.message});
    });
  } else if (request.action === 'captureFullPage') {
    captureFullPage().then(() => {
      sendResponse({success: true});
    }).catch(error => {
      console.error('Error capturing full page:', error);
      sendResponse({success: false, error: error.message});
    });
  } else if (request.action === 'captureArea') {
    captureArea(request.area).then(() => {
      sendResponse({success: true});
    }).catch(error => {
      console.error('Error capturing area:', error);
      sendResponse({success: false, error: error.message});
    });
  } else if (request.action === 'captureSelectedArea') {
    captureSelectedArea(request.rect).then(() => {
      sendResponse({success: true});
    }).catch(error => {
      console.error('Error capturing selected area:', error);
      sendResponse({success: false, error: error.message});
    });
  }
  
  // Required for async response
  return true;
});

// Capture visible tab
async function captureVisibleTab() {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    await saveScreenshot(dataUrl, 'visible');
    console.log('Screenshot captured successfully');
  } catch (error) {
    console.error('Error in captureVisibleTab:', error);
    throw error;
  }
}

// Capture full page (with scrolling and stitching)
async function captureFullPage() {
  try {
    console.log('Starting full page capture...');
    
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('No active tab found');
    }
    
    // Inject content script for page measurements
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['fullpage-content-script.js']
    });
    
    // Get page dimensions
    const dimensions = await chrome.tabs.sendMessage(tab.id, { action: 'getPageDimensions' });
    console.log('Page dimensions:', dimensions);
    
    const viewportHeight = dimensions.viewportHeight;
    const pageHeight = dimensions.height;
    const viewportWidth = dimensions.viewportWidth;
    const pageWidth = dimensions.width;
    
    // If page fits in viewport, just capture normally
    if (pageHeight <= viewportHeight) {
      console.log('Page fits in viewport, capturing normally');
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
      await saveScreenshot(dataUrl, 'full');
      return;
    }
    
    // Calculate number of screenshots needed
    const screenshots = [];
    const numScreenshots = Math.ceil(pageHeight / viewportHeight);
    console.log(`Need ${numScreenshots} screenshots for full page`);
    
    // Store original scroll position
    const originalScrollResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.pageYOffset || document.documentElement.scrollTop
    });
    const originalScrollY = originalScrollResult[0].result;
    
    // Take screenshots by scrolling
    for (let i = 0; i < numScreenshots; i++) {
      const scrollY = i * viewportHeight;
      const isLastScreenshot = i === numScreenshots - 1;
      
      // For the last screenshot, ensure we capture exactly to the bottom
      const actualScrollY = isLastScreenshot ? 
        Math.max(0, pageHeight - viewportHeight) : scrollY;
      
      console.log(`Taking screenshot ${i + 1}/${numScreenshots} at scroll position ${actualScrollY}`);
      
      // Scroll to position
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'scrollToPosition', 
        x: 0, 
        y: actualScrollY 
      });
      
      // Wait a bit more for page to settle
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture screenshot
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
      screenshots.push({
        dataUrl: dataUrl,
        scrollY: actualScrollY,
        index: i
      });
    }
    
    // Restore original scroll position
    await chrome.tabs.sendMessage(tab.id, { 
      action: 'scrollToPosition', 
      x: 0, 
      y: originalScrollY || 0 
    });
    
    // Stitch screenshots together
    console.log('Stitching screenshots together...');
    const stitchedDataUrl = await stitchScreenshots(screenshots, {
      pageWidth: viewportWidth,
      pageHeight: pageHeight,
      viewportHeight: viewportHeight
    });
    
    await saveScreenshot(stitchedDataUrl, 'full');
    console.log('Full page screenshot captured and stitched successfully');
    
  } catch (error) {
    console.error('Error in captureFullPage:', error);
    throw error;
  }
}

// Capture selected area
async function captureArea(area) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    // In a real implementation, we would crop the image based on area
    await saveScreenshot(dataUrl, 'area');
    console.log('Area screenshot captured successfully');
  } catch (error) {
    console.error('Error in captureArea:', error);
    throw error;
  }
}

// Capture selected area with cropping
async function captureSelectedArea(rect) {
  try {
    console.log('Capturing selected area:', rect);
    
    // Capture the full visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    
    // Crop the image based on selection
    const croppedDataUrl = await cropImage(dataUrl, rect);
    
    await saveScreenshot(croppedDataUrl, 'selected-area');
    console.log('Selected area screenshot captured successfully');
  } catch (error) {
    console.error('Error in captureSelectedArea:', error);
    throw error;
  }
}

// Crop image using OffscreenCanvas (Service Worker compatible)
async function cropImage(dataUrl, rect) {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create ImageBitmap from blob (Service Worker compatible)
    const imageBitmap = await createImageBitmap(blob);
    
    // Get image dimensions
    const imgWidth = imageBitmap.width;
    const imgHeight = imageBitmap.height;
    
    // Calculate device pixel ratio adjustments
    // In Service Worker, we need to estimate this since window.devicePixelRatio is unavailable
    const devicePixelRatio = 1; // Default to 1 for Service Worker
    
    // Adjust coordinates
    const scaledRect = {
      x: Math.round(rect.x * devicePixelRatio),
      y: Math.round(rect.y * devicePixelRatio),
      width: Math.round(rect.width * devicePixelRatio),
      height: Math.round(rect.height * devicePixelRatio)
    };
    
    console.log('Original rect:', rect);
    console.log('Scaled rect:', scaledRect);
    console.log('Image dimensions:', imgWidth, 'x', imgHeight);
    
    // Ensure we don't go outside image bounds
    const finalRect = {
      x: Math.max(0, Math.min(scaledRect.x, imgWidth)),
      y: Math.max(0, Math.min(scaledRect.y, imgHeight)),
      width: Math.min(scaledRect.width, imgWidth - scaledRect.x),
      height: Math.min(scaledRect.height, imgHeight - scaledRect.y)
    };
    
    // Ensure positive dimensions
    finalRect.width = Math.max(1, finalRect.width);
    finalRect.height = Math.max(1, finalRect.height);
    
    console.log('Final crop rect:', finalRect);
    
    // Create OffscreenCanvas for cropping
    const canvas = new OffscreenCanvas(finalRect.width, finalRect.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the cropped portion
    ctx.drawImage(
      imageBitmap,
      finalRect.x, finalRect.y, finalRect.width, finalRect.height,  // source rectangle
      0, 0, finalRect.width, finalRect.height                       // destination rectangle
    );
    
    // Convert to blob and then to data URL
    const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(croppedBlob);
    });
    
  } catch (error) {
    console.error('Error in cropImage:', error);
    throw error;
  }
}

// Save screenshot to storage and send notification
async function saveScreenshot(dataUrl, type) {
  const timestamp = new Date().toISOString();
  const screenshot = {
    id: Date.now().toString(),
    dataUrl: dataUrl,
    timestamp: timestamp,
    type: type
  };
  
  console.log('Saving screenshot:', screenshot.id, 'Type:', type);
  
  try {
    // Save to chrome storage
    const data = await chrome.storage.local.get('screenshots');
    console.log('Current storage data:', data);
    
    // Ensure screenshots is always an array
    let screenshots = [];
    if (data.screenshots && Array.isArray(data.screenshots)) {
      screenshots = [...data.screenshots]; // Create a copy
    } else {
      console.log('No existing screenshots or invalid format, starting with empty array');
    }
    
    console.log('Screenshots array before adding:', screenshots.length);
    screenshots.unshift(screenshot);
    console.log('Screenshots array after adding:', screenshots.length);
    
    // Limit to 20 most recent screenshots
    if (screenshots.length > 20) {
      screenshots.pop();
    }
    
    await chrome.storage.local.set({ screenshots: screenshots });
    console.log('Screenshot saved to storage successfully. Total screenshots:', screenshots.length);
    
    // Always trigger storage change event
    chrome.storage.local.get('screenshots', (result) => {
      console.log('Verifying storage save:', result.screenshots?.length || 0, 'screenshots');
    });
    
    // Open editor page with the screenshot
    const editorUrl = chrome.runtime.getURL(`public/editor.html?screenshotId=${screenshot.id}`);
    await chrome.tabs.create({ url: editorUrl });
    console.log('Editor page opened for screenshot:', screenshot.id);
    
    // Try to notify popup if it's open, but don't fail if it's not
    try {
      await chrome.runtime.sendMessage({
        action: 'screenshotTaken',
        screenshot: screenshot
      });
      console.log('Notification sent to popup successfully');
    } catch (error) {
      // Popup might be closed, this is normal
      console.log('Could not send message to popup (probably closed):', error.message);
    }
    
    return screenshot;
  } catch (error) {
    console.error('Error saving screenshot:', error);
    throw error;
  }
}

// Stitch multiple screenshots into one full page image
async function stitchScreenshots(screenshots, dimensions) {
  try {
    console.log('Stitching', screenshots.length, 'screenshots');
    
    const { pageWidth, pageHeight, viewportHeight } = dimensions;
    
    // Create canvas for the final image
    const canvas = new OffscreenCanvas(pageWidth, pageHeight);
    const ctx = canvas.getContext('2d');
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageWidth, pageHeight);
    
    // Process each screenshot
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      console.log(`Processing screenshot ${i + 1}/${screenshots.length}`);
      
      // Convert data URL to blob
      const response = await fetch(screenshot.dataUrl);
      const blob = await response.blob();
      
      // Create ImageBitmap
      const imageBitmap = await createImageBitmap(blob);
      
      // Calculate position for this screenshot
      const yPosition = screenshot.scrollY;
      
      // For the last screenshot, we might need to position it differently
      // to avoid gaps or overlaps
      const isLastScreenshot = i === screenshots.length - 1;
      let actualY = yPosition;
      
      if (isLastScreenshot) {
        // Position the last screenshot so its bottom aligns with the page bottom
        actualY = pageHeight - imageBitmap.height;
      }
      
      // Ensure we don't go negative
      actualY = Math.max(0, actualY);
      
      console.log(`Drawing screenshot ${i + 1} at position (0, ${actualY})`);
      
      // Draw the screenshot onto the canvas
      ctx.drawImage(imageBitmap, 0, actualY);
    }
    
    // Convert canvas to blob and then to data URL
    const finalBlob = await canvas.convertToBlob({ type: 'image/png' });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('Successfully stitched full page screenshot');
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(finalBlob);
    });
    
  } catch (error) {
    console.error('Error in stitchScreenshots:', error);
    throw error;
  }
}