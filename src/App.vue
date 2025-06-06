<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ScreenshotControls from './components/ScreenshotControls.vue';
import ScreenshotHistory from './components/ScreenshotHistory.vue';
import ScreenshotPreview from './components/ScreenshotPreview.vue';
import AppHeader from './components/AppHeader.vue';
import { useScreenshotStore } from './stores/screenshotStore';

const activeTab = ref('capture');
const previewImage = ref('');
const isPreviewActive = ref(false);
const screenshotStore = useScreenshotStore();
const isExtension = ref(!!(typeof chrome !== 'undefined' && chrome.storage));

onMounted(() => {
  if (isExtension.value) {
    console.log('Extension mode detected, setting up listeners');
    
    // Load screenshots from Chrome storage
    chrome.storage.local.get('screenshots', (data) => {
      console.log('Storage data received:', data);
      console.log('Raw screenshots data:', data.screenshots);
      console.log('Loaded screenshots from storage:', data.screenshots?.length || 0);
      
      let validScreenshots: any[] = [];
      if (data.screenshots) {
        if (Array.isArray(data.screenshots)) {
          validScreenshots = data.screenshots;
          console.log('Screenshots is array, length:', validScreenshots.length);
        } else if (typeof data.screenshots === 'object') {
          // Convert object with numeric keys to array
          const keys = Object.keys(data.screenshots).sort((a, b) => parseInt(a) - parseInt(b));
          validScreenshots = keys.map(key => data.screenshots[key]).filter((item: any) => 
            item && typeof item === 'object' && item.id && item.dataUrl
          );
          console.log('Screenshots is object, converted to array length:', validScreenshots.length);
        }
      }
      
      console.log('Final valid screenshots:', validScreenshots.length);
      if (validScreenshots.length > 0) {
        console.log('First screenshot:', validScreenshots[0]?.id);
        console.log('All screenshot IDs:', validScreenshots.map(s => s.id));
      }
      screenshotStore.setScreenshots(validScreenshots);

      // Listen for storage changes - this handles new screenshots automatically
      chrome.storage.onChanged.addListener((changes: {[key: string]: chrome.storage.StorageChange}, namespace: string) => {
        console.log('Storage changed:', changes, 'in namespace:', namespace);
        if (namespace === 'local' && changes.screenshots) {
          console.log('Screenshots updated in storage');
          const newScreenshots = changes.screenshots.newValue;
          console.log('Raw new screenshots from storage change:', newScreenshots);
          
          // Handle both array and object formats
          let validScreenshots: any[] = [];
          if (newScreenshots) {
            if (Array.isArray(newScreenshots)) {
              validScreenshots = newScreenshots;
              console.log('Storage change: screenshots is array, length:', validScreenshots.length);
            } else if (typeof newScreenshots === 'object') {
              // Convert object with numeric keys to array
              const keys = Object.keys(newScreenshots).sort((a, b) => parseInt(a) - parseInt(b));
              validScreenshots = keys.map(key => newScreenshots[key]).filter((item: any) => 
                item && typeof item === 'object' && item.id && item.dataUrl
              );
              console.log('Storage change: screenshots is object, converted to array length:', validScreenshots.length);
            }
          }
          
          console.log('Valid screenshots from storage change:', validScreenshots.length);
          
          // Only update store, don't add duplicates
          screenshotStore.setScreenshots(validScreenshots);
          
          // If a new screenshot was added, show preview
          if (validScreenshots.length > 0) {
            const latestScreenshot = validScreenshots[0];
            console.log('Latest screenshot:', latestScreenshot?.id);
            if (latestScreenshot && latestScreenshot.dataUrl && latestScreenshot.dataUrl !== previewImage.value) {
              console.log('Showing new screenshot preview');
              previewImage.value = latestScreenshot.dataUrl;
              isPreviewActive.value = true;
            }
          }
        }
      });
    });
  } else {
    console.log('Running in web mode (not as extension)');
  }
});

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

const closePreview = () => {
  isPreviewActive.value = false;
};

const viewScreenshot = (screenshot: any) => {
  previewImage.value = screenshot.dataUrl;
  isPreviewActive.value = true;
};
</script>

<template>
  <div class="app-container">
    <AppHeader :activeTab="activeTab" @tabChange="handleTabChange" />
    
    <main class="app-content">
      <ScreenshotControls v-if="activeTab === 'capture'" :isExtension="isExtension" />
      <ScreenshotHistory 
        v-if="activeTab === 'history'" 
        @viewScreenshot="viewScreenshot" 
      />
    </main>

    <ScreenshotPreview 
      v-if="isPreviewActive" 
      :imageUrl="previewImage" 
      @close="closePreview"
    />
  </div>
</template>

<style>
:root {
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #2563EB;
  --color-accent: #10B981;
  --color-accent-light: #34D399;
  --color-accent-dark: #059669;
  --color-text: #1F2937;
  --color-text-light: #4B5563;
  --color-background: #F9FAFB;
  --color-card: #FFFFFF;
  --color-border: #E5E7EB;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.5;
}

.app-container {
  width: 360px;
  height: 480px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  position: relative;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #F9FAFB;
    --color-text-light: #E5E7EB;
    --color-background: #1F2937;
    --color-card: #374151;
    --color-border: #4B5563;
  }
}
</style>