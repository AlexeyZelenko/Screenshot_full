<script setup lang="ts">
const props = defineProps<{
  screenshot: any;
  timestamp: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'delete', id: string): void;
}>();

const handleClick = () => {
  emit('click');
};

const handleEdit = (event: Event) => {
  event.stopPropagation();
  const editorUrl = `public/editor.html?image=${encodeURIComponent(props.screenshot.dataUrl)}`;
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL(editorUrl) });
  } else {
    window.open(editorUrl, '_blank');
  }
};

const handleDelete = (event: Event) => {
  event.stopPropagation();
  emit('delete', props.screenshot.id);
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'visible':
      return 'Visible Area';
    case 'full':
      return 'Full Page';
    case 'area':
      return 'Selected Area';
    default:
      return 'Screenshot';
  }
};
</script>

<template>
  <div class="screenshot-item" @click="handleClick">
    <div class="screenshot-thumbnail">
      <img :src="props.screenshot.dataUrl" alt="Screenshot" />
    </div>
    <div class="screenshot-info">
      <div class="screenshot-type">{{ getTypeLabel(props.screenshot.type) }}</div>
      <div class="screenshot-time">{{ timestamp }}</div>
    </div>
    <div class="item-actions">
      <button class="edit-button" @click="handleEdit" title="Edit screenshot">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="delete-button" @click="handleDelete" title="Delete screenshot">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.screenshot-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid var(--color-border);
}

.screenshot-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.screenshot-thumbnail {
  width: 60px;
  height: 45px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
}

.screenshot-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.screenshot-info {
  flex: 1;
  min-width: 0;
}

.screenshot-type {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--spacing-1);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.screenshot-time {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.edit-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.screenshot-item:hover .edit-button {
  opacity: 1;
}

.edit-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.delete-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.screenshot-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}
</style>