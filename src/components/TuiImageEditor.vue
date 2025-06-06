<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

const props = defineProps<{
  imageUrl: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorContainer = ref<HTMLDivElement>();
let imageEditor: ImageEditor | null = null;

const theme: Record<string, string> = {
  'menu.normalIcon.color': '#8a8a8a',
  'menu.activeIcon.color': '#555555',
  'menu.disabledIcon.color': '#434343',
  'menu.hoverIcon.color': '#e9e9e9',
  'submenu.normalIcon.color': '#8a8a8a',
  'submenu.activeIcon.color': '#e9e9e9',
};

onMounted(() => {
  if (editorContainer.value) {
    imageEditor = new ImageEditor(editorContainer.value, {
      includeUI: {
        loadImage: {
          path: props.imageUrl,
          name: 'Screenshot',
        },
        theme,
        menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
        initMenu: 'filter',
        uiSize: {
          width: '100%',
          height: '600px',
        },
        menuBarPosition: 'bottom',
      },
      cssMaxWidth: window.innerWidth,
      cssMaxHeight: 600,
      usageStatistics: false,
    });

    console.log('Toast UI Image Editor initialized');
  }
});

onBeforeUnmount(() => {
  if (imageEditor) {
    imageEditor.destroy();
  }
});

const handleSave = () => {
  if (imageEditor) {
    const dataURL = imageEditor.toDataURL();
    
    // Download the edited image
    const link = document.createElement('a');
    link.download = `edited-screenshot-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Image saved');
  }
};

const handleCopyToClipboard = async () => {
  if (imageEditor) {
    try {
      const dataURL = imageEditor.toDataURL();
      
      // Convert dataURL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      console.log('Image copied to clipboard');
      
      // Show success feedback (optional)
      const button = document.querySelector('.copy-btn') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '#f59e0b';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      alert('Failed to copy image to clipboard. Please try saving instead.');
    }
  }
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div class="tui-editor-overlay">
    <div class="tui-editor-container">
      <div class="editor-header">
        <h2>Edit Screenshot</h2>
        <div class="editor-actions">
          <button @click="handleSave" class="save-btn">
            💾 Save
          </button>
          <button @click="handleCopyToClipboard" class="copy-btn">
            📋 Copy
          </button>
          <button @click="handleClose" class="close-btn">
            ✕ Close
          </button>
        </div>
      </div>
      
      <div class="editor-content">
        <div ref="editorContainer" class="image-editor"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tui-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.tui-editor-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

.save-btn, .copy-btn, .close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover {
  background: #2563eb;
}

.copy-btn {
  background: #f59e0b;
  color: white;
}

.copy-btn:hover {
  background: #d97706;
}

.close-btn {
  background: #6b7280;
  color: white;
}

.close-btn:hover {
  background: #4b5563;
}

.editor-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.image-editor {
  width: 100%;
  height: 100%;
}

/* Override some Toast UI styles */
:deep(.tui-image-editor-container) {
  background-color: #f8f9fa !important;
}

:deep(.tui-image-editor-main-container) {
  background-color: #ffffff !important;
}

:deep(.tui-image-editor-menu) {
  background-color: #f1f3f4 !important;
}

:deep(.tui-image-editor-submenu) {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
}
</style> 