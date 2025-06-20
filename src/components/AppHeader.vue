<script setup lang="ts">
defineProps<{
  activeTab: string
}>();

const emit = defineEmits<{
  (e: 'tabChange', tab: string): void
}>();

const tabs = [
  { id: 'capture', label: 'Capture' },
  { id: 'history', label: 'History' },
  { id: 'converter', label: '🔄 Converter', isExternal: true }
];

const handleTabClick = (tabId: string) => {
  const clickedTab = tabs.find(tab => tab.id === tabId);
  if (clickedTab?.isExternal) {
    chrome.tabs.create({ url: chrome.runtime.getURL('converter.html') });
  } else {
    emit('tabChange', tabId);
  }
};
</script>

<template>
  <header class="app-header">
    <div class="logo">
      <img src="/icons/icon48.png" alt="Vue Screenshot" class="logo-img" />
      <h1 class="logo-text">Screenshot</h1>
    </div>

    <nav class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id && !tab.isExternal }"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  padding: var(--spacing-4);
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.logo-img {
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-2);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.tabs {
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  background: none;
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  outline: none;
}

.tab-button:focus {
  outline: none;
}

.tab-button:hover {
  color: var(--color-primary);
}

.tab-button.active {
  color: var(--color-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
}

.converter-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  outline: none;
  margin-left: var(--spacing-2);
}

.converter-button:focus {
  outline: none;
}

.converter-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}
</style>