<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isExtension: boolean;
}>();

const isLoading = ref(false);

// Function to send message to background script
const captureScreenshot = (type: string) => {
  if (!props.isExtension) {
    console.warn('Screenshot functionality is only available in extension mode');
    return;
  }

  if (isLoading.value) {
    console.log('Screenshot capture already in progress');
    return;
  }

  // Handle area selection differently
  if (type === 'captureArea') {
    captureAreaSelection();
    return;
  }

  isLoading.value = true;
  
  console.log('Sending screenshot request:', type);
  
  chrome.runtime.sendMessage(
    { action: type },
    (response) => {
      console.log('Response from background:', response);
      
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
      }
      
      if (response && response.success === false) {
        console.error('Screenshot failed:', response.error);
      }
      
      // Reset loading state after operation completes
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    }
  );
};

// Function to handle area selection
const captureAreaSelection = async () => {
  try {
    isLoading.value = true;
    
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('No active tab found');
    }
    
    // Inject content script for area selection
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    });
    
    console.log('Content script injected for area selection');
    
    // Close popup window after successful injection
    window.close();
    
  } catch (error) {
    console.error('Error starting area selection:', error);
    isLoading.value = false;
  }
};

const captureOptions = [
  {
    id: 'captureVisibleTab',
    title: 'Visible Area',
    description: 'Capture what you currently see in your browser',
    icon: 'visible-icon'
  },
  {
    id: 'captureFullPage',
    title: 'Full Page',
    description: 'Capture the entire webpage, including scrollable area',
    icon: 'full-icon'
  },
  {
    id: 'captureArea',
    title: 'Select Area',
    description: 'Capture a specific area by dragging',
    icon: 'area-icon'
  }
];
</script>

<template>
  <div class="screenshot-controls">
    <h2 class="section-title">Take a Screenshot</h2>
    
    <div v-if="!isExtension" class="extension-warning">
      <p>This app needs to be loaded as a Chrome extension to capture screenshots.</p>
      <p>Please build and load it as an unpacked extension in Chrome.</p>
    </div>
    
    <div v-else class="capture-controls">
      <div class="capture-grid">
        <div 
          v-for="option in captureOptions" 
          :key="option.id"
          class="capture-option"
          :class="{ 'loading': isLoading }"
          @click="captureScreenshot(option.id)"
        >
          <div class="capture-icon">
            <svg v-if="option.icon === 'visible-icon'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="10" height="10" rx="1" ry="1"></rect>
            </svg>
            <svg v-else-if="option.icon === 'full-icon'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3h18v18H3z"></path>
              <path d="M9 3v18"></path>
              <path d="M15 3v18"></path>
              <path d="M3 9h18"></path>
              <path d="M3 15h18"></path>
            </svg>
          </div>
          <h3 class="capture-title">{{ option.title }}</h3>
          <p class="capture-description">{{ option.description }}</p>
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screenshot-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.extension-warning {
  background-color: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  color: #92400E;
}

.extension-warning p {
  margin-bottom: var(--spacing-2);
}

.extension-warning p:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--spacing-1);
  text-align: center;
}

.capture-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.capture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-1);
  max-width: none;
  margin: 0 auto;
}

.capture-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--color-border);
  min-height: 85px;
  min-width: 0;
}

.capture-option:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}

.capture-option.loading {
  opacity: 0.6;
  pointer-events: none;
}

.capture-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  color: white;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.capture-icon svg {
  width: 14px;
  height: 14px;
}

.capture-title {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0;
  text-align: center;
  line-height: 1.2;
}

.capture-description {
  font-size: 0.625rem;
  color: var(--color-text-light);
  text-align: center;
  line-height: 1.2;
  margin: 0;
}

.loading-indicator {
  width: 100%;
  height: 4px;
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.spinner {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>