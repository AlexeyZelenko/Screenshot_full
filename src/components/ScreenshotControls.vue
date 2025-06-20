<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isExtension: boolean;
}>();

const isLoading = ref(false);
const activeOption = ref('');

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

  activeOption.value = type;

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
        activeOption.value = '';
      }, 800);
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
    activeOption.value = '';
  }
};

const captureOptions = [
  {
    id: 'captureVisibleTab',
    title: 'Visible Area',
    description: 'Current viewport',
    icon: 'visible-icon',
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-50'
  },
  {
    id: 'captureFullPage',
    title: 'Full Page',
    description: 'Entire webpage',
    icon: 'full-icon',
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-50'
  },
  {
    id: 'captureArea',
    title: 'Select Area',
    description: 'Custom selection',
    icon: 'area-icon',
    gradient: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-50'
  }
];
</script>

<template>
  <div class="screenshot-controls">   
    
    <div v-if="!isExtension" class="extension-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h3>Extension Required</h3>
        <p>This app needs to be loaded as a Chrome extension to capture screenshots.</p>
        <p>Please build and load it as an unpacked extension in Chrome.</p>
      </div>
    </div>
    
    <div v-else class="capture-controls">
      <div class="capture-grid">
        <div 
          v-for="option in captureOptions" 
          :key="option.id"
          class="capture-option"
          :class="{ 
            'loading': isLoading && activeOption === option.id,
            'disabled': isLoading && activeOption !== option.id,
            [option.bgGlow]: true 
          }"
          @click="captureScreenshot(option.id)"
        >
          <div class="capture-icon" :class="`bg-gradient-to-br ${option.gradient}`">
            <svg v-if="option.icon === 'visible-icon'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <svg v-else-if="option.icon === 'full-icon'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M9 3v18"/>
              <path d="M15 3v18"/>
              <path d="M3 9h18"/>
              <path d="M3 15h18"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 3v6h10V3"/>
              <path d="M17 21v-6H7v6"/>
              <path d="M12 9v6"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          
          <div class="capture-content">
            <h3 class="capture-title">{{ option.title }}</h3>
            <p class="capture-description">{{ option.description }}</p>
          </div>
          
          <div v-if="isLoading && activeOption === option.id" class="loading-overlay">
            <div class="loading-spinner"></div>
            <span class="loading-text">Capturing...</span>
          </div>
          
          <div class="hover-indicator"></div>
        </div>
      </div>
      
      <div class="footer-hint">
        <div class="hint-icon">💡</div>
        <p>Click any option above to capture your screen</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screenshot-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px; 
  min-height: 250px;
}

.header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.camera-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.extension-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 8px 0;
}

.warning-content p {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0 0 4px 0;
  line-height: 1.5;
}

.warning-content p:last-child {
  margin-bottom: 0;
}

.capture-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.capture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.capture-option {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 15px 10px;
  background: #1F2937;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  min-height: 70px;
  overflow: hidden;
}

.capture-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.capture-option:hover .hover-indicator {
  opacity: 1;
  transform: scale(1);
}

.capture-option.loading {
  pointer-events: none;
}

.capture-option.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.capture-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.capture-option:hover .capture-icon {
  transform: scale(1.1);
}

.capture-content {
  text-align: center;
  flex: 1;
}

.capture-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
  line-height: 1.3;
}

.capture-description {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  border-radius: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
}

.hover-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.footer-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.hint-icon {
  font-size: 1rem;
}

.footer-hint p {
  font-size: 0.8rem;
  color: #4338ca;
  margin: 0;
  font-weight: 500;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-purple-50 {
  background-color: #faf5ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
}

.to-cyan-500 {
  --tw-gradient-to: #06b6d4;
}

.from-purple-500 {
  --tw-gradient-from: #8b5cf6;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0));
}

.to-pink-500 {
  --tw-gradient-to: #ec4899;
}

.from-green-500 {
  --tw-gradient-from: #10b981;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0));
}

.to-emerald-500 {
  --tw-gradient-to: #10b981;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .capture-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .capture-option {
    min-height: 70px;
    padding: 8px 6px;
  }
  
  .capture-icon {
    width: 40px;
    height: 40px;
  }
  
  .capture-icon svg {
    width: 18px;
    height: 18px;
  }
}
</style>