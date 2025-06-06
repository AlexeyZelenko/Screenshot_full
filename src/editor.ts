import { createApp } from 'vue';
import EditorPage from './components/EditorPage.vue';
import './style.css';

console.log('Editor script loaded');

const urlParams = new URLSearchParams(window.location.search);
const imageUrl = urlParams.get('image');
const screenshotId = urlParams.get('screenshotId');

console.log('URL params:', { imageUrl, screenshotId });

async function loadScreenshotById(id: string): Promise<string | null> {
  try {
    console.log('Loading screenshot by ID:', id);
    const data = await chrome.storage.local.get('screenshots');
    console.log('Storage data:', data);
    if (data.screenshots && Array.isArray(data.screenshots)) {
      const screenshot = data.screenshots.find((s: any) => s.id === id);
      console.log('Found screenshot:', !!screenshot);
      return screenshot ? screenshot.dataUrl : null;
    }
    return null;
  } catch (error) {
    console.error('Error loading screenshot:', error);
    return null;
  }
}

async function initEditor() {
  console.log('Initializing editor...');
  let finalImageUrl = null;

  if (screenshotId) {
    console.log('Loading screenshot by ID...');
    // Load screenshot by ID from storage
    finalImageUrl = await loadScreenshotById(screenshotId);
    if (!finalImageUrl) {
      console.error('Screenshot not found');
      document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;"><p>Screenshot not found</p></div>';
      return;
    }
  } else if (imageUrl) {
    console.log('Using direct image URL...');
    // Use direct image URL
    finalImageUrl = imageUrl;
  }

  if (finalImageUrl) {
    console.log('Creating Vue app with image URL:', finalImageUrl.substring(0, 50) + '...');
    const app = createApp(EditorPage, { imageUrl: finalImageUrl });
    app.mount('#editor');
    console.log('Vue app mounted');
  } else {
    console.error('No image URL or screenshot ID provided');
    document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;"><p>No image URL or screenshot ID provided</p></div>';
  }
}

// Initialize editor
console.log('Starting editor initialization...');
initEditor(); 