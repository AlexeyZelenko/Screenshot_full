<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

const props = defineProps<{
  imageUrl: string;
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
        uiSize: {
          width: '100%',
          height: '100%',
        },
        menuBarPosition: 'bottom',
      },
      cssMaxWidth: window.innerWidth,
      cssMaxHeight: window.innerHeight - 100,
      usageStatistics: false,
    });

    console.log('Toast UI Image Editor initialized on separate page');
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
  window.close();
};
</script>

<template>
  <div class="editor-page">
    <div class="editor-header">
      <h1>Screenshot Editor</h1>
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
</template>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.editor-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

.save-btn, .copy-btn, .close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.copy-btn {
  background: #f59e0b;
  color: white;
}

.copy-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.close-btn {
  background: #6b7280;
  color: white;
}

.close-btn:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.editor-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  background: white;
  margin: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.image-editor {
  width: 100%;
  height: 100%;
}

/* Override Toast UI styles for full page */
:deep(.tui-image-editor-container) {
  background-color: #ffffff !important;
  height: 100% !important;
}

:deep(.tui-image-editor-main-container) {
  background-color: #ffffff !important;
}

:deep(.tui-image-editor-menu) {
  background-color: #f8f9fa !important;
}

:deep(.tui-image-editor-submenu) {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
}

:deep(.tui-image-editor-canvas-container) {
  background-color: #f8f9fa !important;
}

/* Hide zoom and hand tool buttons */
:deep(.tui-image-editor-header-buttons) {
  display: none !important;
}

:deep(.tui-image-editor-controls-buttons) {
  display: none !important;
}

:deep(.tui-image-editor-header .tui-image-editor-controls) {
  display: none !important;
}

:deep(.tui-image-editor-header .tui-image-editor-help-menu) {
  display: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .editor-actions {
    justify-content: center;
  }
  
  .editor-content {
    margin: 8px;
  }
}

/* Control buttons */
.editor-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.image-editor-page {
  position: relative;
  width: 100%;
  height: 100%;
}
</style> 