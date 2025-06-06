<template>
  <div class="image-converter">
    <div class="converter-header">
      <h2>🔄 Image Converter</h2>
      <p>Convert images to different formats and resize them</p>
    </div>

    <!-- Image Upload Area -->
    <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent @dragleave.prevent>
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none">
      <div v-if="!originalImage" class="upload-placeholder">
        <div class="upload-icon">📁</div>
        <p>Click to upload image or drag & drop</p>
        <small>Supports: JPEG, PNG, WebP, GIF, BMP</small>
      </div>
      <div v-else class="image-preview">
        <img :src="originalImage" alt="Original image" />
        <div class="image-info">
          <p><strong>Original:</strong> {{ originalWidth }}×{{ originalHeight }}px</p>
          <p><strong>Size:</strong> {{ formatFileSize(originalSize) }}</p>
          <p><strong>Format:</strong> {{ originalFormat }}</p>
        </div>
      </div>
    </div>

    <!-- Conversion Controls -->
    <div v-if="originalImage" class="conversion-controls">
      <div class="control-section">
        <h3>🎨 Output Format</h3>
        <div class="format-options">
          <label v-for="format in availableFormats" :key="format.value" class="format-option">
            <input type="radio" :value="format.value" v-model="selectedFormat" />
            <span class="format-label">
              <span class="format-name">{{ format.name }}</span>
              <span class="format-desc">{{ format.description }}</span>
            </span>
          </label>
        </div>
      </div>

      <div class="control-section">
        <h3>📏 Resize Options</h3>
        <div class="resize-controls">
          <label class="resize-option">
            <input type="radio" value="none" v-model="resizeMode" />
            <span>Keep Original Size</span>
          </label>
          <label class="resize-option">
            <input type="radio" value="percentage" v-model="resizeMode" />
            <span>Resize by Percentage</span>
          </label>
          <label class="resize-option">
            <input type="radio" value="pixels" v-model="resizeMode" />
            <span>Resize to Specific Dimensions</span>
          </label>
        </div>

        <div v-if="resizeMode === 'percentage'" class="resize-inputs">
          <label>
            Scale:
            <select v-model="resizePercentage">
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
              <option value="125">125%</option>
              <option value="150">150%</option>
              <option value="200">200%</option>
            </select>
          </label>
        </div>

        <div v-if="resizeMode === 'pixels'" class="resize-inputs">
          <label>
            Width:
            <input type="number" v-model.number="targetWidth" min="1" max="10000" />
          </label>
          <label>
            Height:
            <input type="number" v-model.number="targetHeight" min="1" max="10000" />
          </label>
          <label class="maintain-ratio">
            <input type="checkbox" v-model="maintainAspectRatio" @change="updateAspectRatio" />
            <span>Maintain aspect ratio</span>
          </label>
        </div>
      </div>

      <div v-if="needsQuality" class="control-section">
        <h3>⚙️ Quality Settings</h3>
        <div class="quality-control">
          <label>
            Quality: {{ quality }}%
            <input type="range" v-model.number="quality" min="10" max="100" step="5" />
          </label>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <h3>👀 Preview</h3>
        <div class="preview-comparison">
          <div class="preview-item">
            <h4>Original</h4>
            <canvas ref="originalCanvas" class="preview-canvas"></canvas>
            <p>{{ formatFileSize(originalSize) }}</p>
          </div>
          <div class="preview-item">
            <h4>Converted</h4>
            <canvas ref="convertedCanvas" class="preview-canvas"></canvas>
            <p v-if="convertedSize">{{ formatFileSize(convertedSize) }}</p>
            <p v-if="compressionRatio" class="compression-info">
              {{ compressionRatio > 0 ? '↓' : '↑' }} {{ Math.abs(compressionRatio) }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="convertImage" :disabled="isConverting" class="convert-btn">
          <span v-if="isConverting">🔄 Converting...</span>
          <span v-else>✨ Convert Image</span>
        </button>
        <button v-if="convertedDataUrl" @click="downloadImage" class="download-btn">
          📥 Download
        </button>
        <button v-if="convertedDataUrl" @click="saveToHistory" class="save-btn">
          💾 Save to History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

const fileInput = ref<HTMLInputElement>()
const originalCanvas = ref<HTMLCanvasElement>()
const convertedCanvas = ref<HTMLCanvasElement>()

// Image data
const originalImage = ref<string>()
const originalWidth = ref(0)
const originalHeight = ref(0)
const originalSize = ref(0)
const originalFormat = ref('')
const convertedDataUrl = ref<string>()
const convertedSize = ref(0)

// Controls
const selectedFormat = ref('jpeg')
const resizeMode = ref('none')
const resizePercentage = ref(100)
const targetWidth = ref(0)
const targetHeight = ref(0)
const maintainAspectRatio = ref(true)
const quality = ref(85)
const isConverting = ref(false)

const availableFormats = [
  {
    value: 'jpeg',
    name: 'JPEG',
    description: 'Best for photos, smaller files'
  },
  {
    value: 'png',
    name: 'PNG',
    description: 'Lossless, supports transparency'
  },
  {
    value: 'webp',
    name: 'WebP',
    description: 'Modern format, great compression'
  },
  {
    value: 'avif',
    name: 'AVIF',
    description: 'Next-gen format, smallest files'
  }
]

const needsQuality = computed(() => {
  return ['jpeg', 'webp', 'avif'].includes(selectedFormat.value)
})

const compressionRatio = computed(() => {
  if (!originalSize.value || !convertedSize.value) return null
  const ratio = ((originalSize.value - convertedSize.value) / originalSize.value) * 100
  return Math.round(ratio)
})

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    loadImage(file)
  }
}

const loadImage = (file: File) => {
  originalSize.value = file.size
  originalFormat.value = file.type.split('/')[1].toUpperCase()
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      originalWidth.value = img.width
      originalHeight.value = img.height
      targetWidth.value = img.width
      targetHeight.value = img.height
      
      originalImage.value = e.target?.result as string
      nextTick(() => {
        drawOriginalPreview(img)
      })
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const drawOriginalPreview = (img: HTMLImageElement) => {
  if (!originalCanvas.value) return
  
  const canvas = originalCanvas.value
  const ctx = canvas.getContext('2d')!
  
  // Set preview size
  const maxSize = 200
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}

const updateAspectRatio = () => {
  if (maintainAspectRatio.value && originalWidth.value && originalHeight.value) {
    const ratio = originalWidth.value / originalHeight.value
    watch(() => targetWidth.value, (newWidth) => {
      if (maintainAspectRatio.value) {
        targetHeight.value = Math.round(newWidth / ratio)
      }
    })
    watch(() => targetHeight.value, (newHeight) => {
      if (maintainAspectRatio.value) {
        targetWidth.value = Math.round(newHeight * ratio)
      }
    })
  }
}

const convertImage = async () => {
  if (!originalImage.value) return
  
  isConverting.value = true
  
  try {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Calculate output dimensions
      let outputWidth = originalWidth.value
      let outputHeight = originalHeight.value
      
      if (resizeMode.value === 'percentage') {
        const scale = resizePercentage.value / 100
        outputWidth = Math.round(originalWidth.value * scale)
        outputHeight = Math.round(originalHeight.value * scale)
      } else if (resizeMode.value === 'pixels') {
        outputWidth = targetWidth.value
        outputHeight = targetHeight.value
      }
      
      canvas.width = outputWidth
      canvas.height = outputHeight
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight)
      
      // Convert to target format
      const mimeType = `image/${selectedFormat.value}`
      const qualityValue = needsQuality.value ? quality.value / 100 : undefined
      
      // Try to convert to target format
      try {
        convertedDataUrl.value = canvas.toDataURL(mimeType, qualityValue)
        
        // Check if conversion was successful (some browsers might not support AVIF)
        if (!convertedDataUrl.value || convertedDataUrl.value === 'data:,') {
          throw new Error(`Format ${selectedFormat.value} not supported by browser`)
        }
      } catch (formatError) {
        console.warn(`Format ${selectedFormat.value} not supported, falling back to PNG`)
        // Fallback to PNG if the format is not supported
        convertedDataUrl.value = canvas.toDataURL('image/png')
        alert(`${selectedFormat.value.toUpperCase()} format is not supported in your browser. Converted to PNG instead.`)
      }
      
      // Calculate converted size (approximate)
      const base64Length = convertedDataUrl.value.split(',')[1].length
      convertedSize.value = (base64Length * 3) / 4
      
      // Draw preview
      drawConvertedPreview(canvas)
      isConverting.value = false
    }
    
    img.onerror = () => {
      console.error('Failed to load image')
      isConverting.value = false
      alert('Failed to load image. Please try again.')
    }
    
    img.src = originalImage.value
  } catch (error) {
    console.error('Conversion failed:', error)
    isConverting.value = false
    alert('Conversion failed. Please try again.')
  }
}

const drawConvertedPreview = (sourceCanvas: HTMLCanvasElement) => {
  if (!convertedCanvas.value) return
  
  const canvas = convertedCanvas.value
  const ctx = canvas.getContext('2d')!
  
  // Set preview size
  const maxSize = 200
  const scale = Math.min(maxSize / sourceCanvas.width, maxSize / sourceCanvas.height)
  canvas.width = sourceCanvas.width * scale
  canvas.height = sourceCanvas.height * scale
  
  ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height)
}

const downloadImage = () => {
  if (!convertedDataUrl.value) return
  
  const link = document.createElement('a')
  link.download = `converted_image.${selectedFormat.value}`
  link.href = convertedDataUrl.value
  link.click()
}

const saveToHistory = () => {
  if (!convertedDataUrl.value) return
  
  // Save to browser storage (same as screenshot history)
  const screenshots = JSON.parse(localStorage.getItem('vue-screenshot-history') || '[]')
  const newScreenshot = {
    id: Date.now().toString(),
    dataUrl: convertedDataUrl.value,
    timestamp: new Date().toISOString(),
    type: 'converted-image'
  }
  
  screenshots.unshift(newScreenshot)
  localStorage.setItem('vue-screenshot-history', JSON.stringify(screenshots))
  
  // Show notification
  alert('Image saved to history!')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.image-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-4);
}

.converter-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.converter-header h2 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-2);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-6);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: var(--spacing-6);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.upload-placeholder .upload-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-2);
}

.image-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: var(--border-radius);
}

.image-info {
  text-align: left;
}

.control-section {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.control-section h3 {
  margin-bottom: var(--spacing-3);
  color: var(--text-primary);
}

.format-options {
  display: grid;
  gap: var(--spacing-2);
}

.format-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-option:hover {
  background-color: var(--bg-secondary);
}

.format-option input[type="radio"]:checked + .format-label {
  color: var(--primary-color);
  font-weight: 600;
}

.format-name {
  font-weight: 600;
  display: block;
}

.format-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: block;
}

.resize-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.resize-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}

.resize-inputs {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}

.resize-inputs label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.resize-inputs input, .resize-inputs select {
  padding: var(--spacing-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.maintain-ratio {
  align-items: center !important;
  flex-direction: row !important;
}

.quality-control label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.quality-control input[type="range"] {
  width: 100%;
}

.preview-section {
  margin: var(--spacing-6) 0;
}

.preview-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.preview-item {
  text-align: center;
  padding: var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.preview-canvas {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  max-width: 100%;
}

.compression-info {
  font-weight: 600;
  color: var(--success-color);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.convert-btn {
  background-color: var(--primary-color);
  color: white;
}

.convert-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.convert-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background-color: var(--success-color);
  color: white;
}

.download-btn:hover {
  background-color: var(--success-hover);
}

.save-btn {
  background-color: var(--info-color);
  color: white;
}

.save-btn:hover {
  background-color: var(--info-hover);
}

@media (max-width: 768px) {
  .preview-comparison {
    grid-template-columns: 1fr;
  }
  
  .resize-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 