<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useScreenshotStore } from '../stores/screenshotStore';
import ScreenshotItem from './ScreenshotItem.vue';

const screenshotStore = useScreenshotStore();

console.log('ScreenshotHistory: Store instance created');
console.log('ScreenshotHistory: Initial screenshots ref:', screenshotStore.screenshots);
console.log('ScreenshotHistory: Initial screenshots value:', screenshotStore.screenshots.value);
console.log('ScreenshotHistory: Initial screenshots length:', screenshotStore.screenshots.value.length);

const screenshots = computed(() => {
  const value = screenshotStore.screenshots.value;
  console.log('ScreenshotHistory computed: direct ref value =', value);
  console.log('ScreenshotHistory computed: screenshots count =', value.length);
  console.log('ScreenshotHistory computed: screenshots array =', value);
  return value;
});

onMounted(() => {
  console.log('ScreenshotHistory mounted');
  console.log('ScreenshotHistory mounted: screenshots.value length =', screenshots.value.length);
  console.log('ScreenshotHistory mounted: store screenshots length =', screenshotStore.screenshots.value.length);
});

// Watch for changes in screenshots
watch(screenshots, (newValue) => {
  console.log('Screenshots changed in ScreenshotHistory:', newValue.length);
  console.log('Screenshots watch - new value:', newValue);
}, { immediate: true });

// Also watch the store directly
watch(() => screenshotStore.screenshots.value, (newValue) => {
  console.log('Store screenshots changed directly in ScreenshotHistory:', newValue.length);
}, { immediate: true });

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const emit = defineEmits<{
  (e: 'viewScreenshot', screenshot: any): void;
}>();

const handleScreenshotClick = (screenshot: any) => {
  console.log('Screenshot clicked:', screenshot.id);
  emit('viewScreenshot', screenshot);
};

const deleteScreenshot = (id: string) => {
  console.log('Deleting screenshot:', id);
  screenshotStore.deleteScreenshot(id);
};

const clearAllScreenshots = () => {
  console.log('Clearing all screenshots');
  if (confirm('Are you sure you want to delete all screenshots?')) {
    screenshotStore.clearAllScreenshots();
  }
};
</script>

<template>
  <div class="screenshot-history">
    <div class="history-header">
      <h2 class="section-title">Screenshot History</h2>
      <button 
        v-if="screenshots.length > 0" 
        @click="clearAllScreenshots" 
        class="clear-all-btn"
      >
        🗑️ Clear All
      </button>
    </div>
    
    <div v-if="screenshots.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <p class="empty-text">No screenshots yet. Take your first screenshot!</p>
    </div>
    
    <div v-else class="history-list">
      <ScreenshotItem 
        v-for="screenshot in screenshots" 
        :key="screenshot.id"
        :screenshot="screenshot"
        :timestamp="formatDate(screenshot.timestamp)"
        @click="handleScreenshotClick(screenshot)"
        @delete="deleteScreenshot(screenshot.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.screenshot-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-2);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.clear-all-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-1) var(--spacing-3);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.clear-all-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: var(--color-background);
  color: var(--color-text-light);
  border-radius: 50%;
}

.empty-text {
  text-align: center;
  color: var(--color-text-light);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
</style>