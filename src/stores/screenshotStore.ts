import { ref } from 'vue';

interface Screenshot {
  id: string;
  dataUrl: string;
  timestamp: string;
  type: string;
}

// Create a singleton store instance
const screenshots = ref<Screenshot[]>([]);

const setScreenshots = (newScreenshots: Screenshot[]) => {
  console.log('Setting screenshots in SINGLETON store:', newScreenshots.length);
  if (newScreenshots.length > 0) {
    console.log('First screenshot in setScreenshots:', newScreenshots[0].id);
    console.log('All screenshot IDs in setScreenshots:', newScreenshots.map(s => s.id));
  }
  screenshots.value = [...newScreenshots]; // Force reactivity with spread
  console.log('Screenshots value after setting in SINGLETON store:', screenshots.value.length);
};

const addScreenshot = (screenshot: Screenshot) => {
  console.log('Adding screenshot to SINGLETON store:', screenshot.id);
  screenshots.value = [screenshot, ...screenshots.value]; // Force reactivity with new array
  console.log('Total screenshots in SINGLETON store after adding:', screenshots.value.length);
  saveToStorage();
};

const deleteScreenshot = (id: string) => {
  console.log('Deleting screenshot from SINGLETON store:', id);
  screenshots.value = screenshots.value.filter(s => s.id !== id); // Force reactivity with new array
  console.log('Remaining screenshots in SINGLETON store:', screenshots.value.length);
  saveToStorage();
};

const clearAllScreenshots = () => {
  console.log('Clearing all screenshots from SINGLETON store');
  screenshots.value = [];
  saveToStorage();
};

const saveToStorage = () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    console.log('Saving screenshots to storage from SINGLETON store:', screenshots.value.length);
    console.log('Screenshots array is valid:', Array.isArray(screenshots.value));
    
    // Ensure we save as a clean array
    const screenshotsArray = [...screenshots.value];
    console.log('Saving clean array with length:', screenshotsArray.length);
    
    chrome.storage.local.set({ screenshots: screenshotsArray }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving to storage:', chrome.runtime.lastError);
      } else {
        console.log('Successfully saved to storage');
        
        // Verify what was actually saved
        chrome.storage.local.get('screenshots', (data) => {
          console.log('Verification - saved data type:', typeof data.screenshots);
          console.log('Verification - saved data is array:', Array.isArray(data.screenshots));
          console.log('Verification - saved data length:', data.screenshots?.length || 0);
        });
      }
    });
  } else {
    console.log('Chrome storage not available');
  }
};

// Export a function that returns the same store instance
export function useScreenshotStore() {
  console.log('useScreenshotStore called - current screenshots count:', screenshots.value.length);
  
  return {
    screenshots,
    setScreenshots,
    addScreenshot,
    deleteScreenshot,
    clearAllScreenshots
  };
}