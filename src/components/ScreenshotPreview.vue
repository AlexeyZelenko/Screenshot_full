<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  imageUrl: string
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};

const downloadImage = () => {
  const a = document.createElement('a');
  a.href = props.imageUrl;
  a.download = `screenshot-${new Date().toISOString().replace(/:/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const copyToClipboard = async () => {
  try {
    const blob = await fetch(props.imageUrl).then(r => r.blob());
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    showToast('Copied to clipboard!');
  } catch (err) {
    showToast('Failed to copy');
    console.error('Failed to copy:', err);
  }
};

const openInEditor = () => {
  const editorUrl = `public/editor.html?image=${encodeURIComponent(props.imageUrl)}`;
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL(editorUrl) });
  } else {
    window.open(editorUrl, '_blank');
  }
};

const toast = ref({
  visible: false,
  message: ''
});

const showToast = (message: string) => {
  toast.value = {
    visible: true,
    message
  };
  
  setTimeout(() => {
    toast.value.visible = false;
  }, 2000);
};
</script>

<template>
  <div class="preview-overlay" @click.self="handleClose">
    <div class="preview-container">
      <div class="preview-header">
        <h3 class="preview-title">Screenshot Preview</h3>
        <button class="close-button" @click="handleClose">×</button>
      </div>
      
      <div class="preview-content">
        <img :src="imageUrl" alt="Screenshot preview" class="preview-image" />
      </div>
      
      <div class="preview-actions">
        <button class="action-button" @click="downloadImage">
          Download
        </button>
        <button class="action-button" @click="copyToClipboard">
          Copy
        </button>
        <button class="action-button" @click="openInEditor">
          Edit
        </button>
      </div>
    </div>
    
    <div class="toast" :class="{ 'visible': toast.visible }">
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.preview-container {
  width: 90%;
  max-width: 340px;
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slide-up 0.3s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  font-size: 1.5rem;
  line-height: 1;
  padding: var(--spacing-1);
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: var(--color-background);
}

.preview-content {
  padding: var(--spacing-4);
  overflow: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.preview-actions {
  display: flex;
  padding: var(--spacing-4);
  gap: var(--spacing-2);
  border-top: 1px solid var(--color-border);
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: var(--color-accent);
  color: white;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 200;
}

.toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>