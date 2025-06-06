<script setup lang="ts">
defineProps<{
  text: string;
  type?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}>();
</script>

<template>
  <button 
    class="button-with-icon" 
    :class="[
      `button-${type || 'primary'}`,
      { 'disabled': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span class="icon">
      <slot name="icon"></slot>
    </span>
    <span class="text">{{ text }}</span>
  </button>
</template>

<style scoped>
.button-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.button-primary {
  background-color: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background-color: var(--color-primary-dark);
}

.button-secondary {
  background-color: var(--color-accent);
  color: white;
}

.button-secondary:hover {
  background-color: var(--color-accent-dark);
}

.button-outline {
  background-color: transparent;
  border-color: var(--color-border);
  color: var(--color-text);
}

.button-outline:hover {
  background-color: var(--color-background);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.button-with-icon.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>