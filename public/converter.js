// Image Converter functionality
class ImageConverter {
    constructor() {
        this.originalImage = null;
        this.originalImageData = null;
        this.convertedDataUrl = null;
        this.isConverting = false;
        
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        // DOM elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.imageDimensions = document.getElementById('imageDimensions');
        this.imageSize = document.getElementById('imageSize');
        this.imageFormat = document.getElementById('imageFormat');
        
        this.conversionControls = document.getElementById('conversionControls');
        this.formatOptions = document.getElementById('formatOptions');
        this.qualitySection = document.getElementById('qualitySection');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        
        this.percentageInputs = document.getElementById('percentageInputs');
        this.pixelInputs = document.getElementById('pixelInputs');
        this.resizePercentage = document.getElementById('resizePercentage');
        this.targetWidth = document.getElementById('targetWidth');
        this.targetHeight = document.getElementById('targetHeight');
        this.maintainRatio = document.getElementById('maintainRatio');
        
        this.previewSection = document.getElementById('previewSection');
        this.originalCanvas = document.getElementById('originalCanvas');
        this.convertedCanvas = document.getElementById('convertedCanvas');
        this.originalSize = document.getElementById('originalSize');
        this.convertedSize = document.getElementById('convertedSize');
        this.compressionInfo = document.getElementById('compressionInfo');
        
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.clearBtn = document.getElementById('clearBtn');
    }

    bindEvents() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Format selection
        this.formatOptions.addEventListener('change', (e) => this.handleFormatChange(e));
        
        // Resize options
        document.querySelectorAll('input[name="resize"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleResizeChange(e));
        });

        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value;
        });

        // Dimension inputs with aspect ratio
        this.targetWidth.addEventListener('input', () => this.updateAspectRatio('width'));
        this.targetHeight.addEventListener('input', () => this.updateAspectRatio('height'));

        // Action buttons
        this.convertBtn.addEventListener('click', () => this.convertImage());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.saveBtn.addEventListener('click', () => this.saveToHistory());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) this.loadImage(file);
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleFormatChange(event) {
        const selectedFormat = event.target.value;
        const needsQuality = ['jpeg', 'webp', 'avif'].includes(selectedFormat);
        
        if (needsQuality) {
            this.qualitySection.classList.remove('hidden');
        } else {
            this.qualitySection.classList.add('hidden');
        }

        // Update visual selection
        document.querySelectorAll('.format-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.format-option').classList.add('selected');
    }

    handleResizeChange(event) {
        const resizeMode = event.target.value;
        
        this.percentageInputs.classList.add('hidden');
        this.pixelInputs.classList.add('hidden');
        
        if (resizeMode === 'percentage') {
            this.percentageInputs.classList.remove('hidden');
        } else if (resizeMode === 'pixels') {
            this.pixelInputs.classList.remove('hidden');
        }
    }

    async loadImage(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.originalImageData = {
                        width: img.width,
                        height: img.height,
                        size: file.size,
                        format: file.type.split('/')[1].toUpperCase()
                    };
                    
                    this.displayImageInfo();
                    this.drawOriginalPreview();
                    this.showControls();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.showNotification('Failed to load image', 'error');
        }
    }

    displayImageInfo() {
        const data = this.originalImageData;
        
        this.previewImg.src = this.originalImage.src;
        this.imageDimensions.textContent = `Dimensions: ${data.width}×${data.height}px`;
        this.imageSize.textContent = `Size: ${this.formatFileSize(data.size)}`;
        this.imageFormat.textContent = `Format: ${data.format}`;
        
        // Set default resize values
        this.targetWidth.value = data.width;
        this.targetHeight.value = data.height;
        
        // Show image preview, hide placeholder
        this.uploadPlaceholder.classList.add('hidden');
        this.imagePreview.classList.remove('hidden');
    }

    drawOriginalPreview() {
        const canvas = this.originalCanvas;
        const ctx = canvas.getContext('2d');
        
        // Calculate preview size (max 300px)
        const maxSize = 300;
        const scale = Math.min(maxSize / this.originalImage.width, maxSize / this.originalImage.height);
        canvas.width = this.originalImage.width * scale;
        canvas.height = this.originalImage.height * scale;
        
        ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);
        this.originalSize.textContent = this.formatFileSize(this.originalImageData.size);
    }

    showControls() {
        this.conversionControls.classList.remove('hidden');
        
        // Set initial format selection visual
        document.querySelector('input[name="format"]:checked').closest('.format-option').classList.add('selected');
    }

    updateAspectRatio(changedField) {
        if (!this.maintainRatio.checked || !this.originalImageData) return;
        
        const ratio = this.originalImageData.width / this.originalImageData.height;
        
        if (changedField === 'width') {
            this.targetHeight.value = Math.round(this.targetWidth.value / ratio);
        } else {
            this.targetWidth.value = Math.round(this.targetHeight.value * ratio);
        }
    }

    async convertImage() {
        if (!this.originalImage || this.isConverting) return;
        
        this.isConverting = true;
        this.convertBtn.disabled = true;
        this.convertBtn.innerHTML = '<span>🔄 Converting...</span>';
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate output dimensions
            const dimensions = this.getOutputDimensions();
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            
            // Draw resized image
            ctx.drawImage(this.originalImage, 0, 0, dimensions.width, dimensions.height);
            
            // Get conversion parameters
            const format = document.querySelector('input[name="format"]:checked').value;
            const quality = parseInt(this.qualitySlider.value) / 100;
            const mimeType = `image/${format}`;
            
            // Convert to target format with fallback
            try {
                this.convertedDataUrl = canvas.toDataURL(mimeType, quality);
                
                // Check if conversion was successful
                if (!this.convertedDataUrl || this.convertedDataUrl === 'data:,') {
                    throw new Error(`Format ${format} not supported`);
                }
            } catch (formatError) {
                console.warn(`Format ${format} not supported, falling back to PNG`);
                this.convertedDataUrl = canvas.toDataURL('image/png');
                this.showNotification(`${format.toUpperCase()} format is not supported in your browser. Converted to PNG instead.`, 'info');
            }
            
            // Calculate converted size
            const base64Length = this.convertedDataUrl.split(',')[1].length;
            const convertedBytes = (base64Length * 3) / 4;
            
            // Draw preview and show results
            this.drawConvertedPreview(canvas);
            this.showConversionResults(convertedBytes);
            this.showActionButtons();
            
        } catch (error) {
            console.error('Conversion failed:', error);
            this.showNotification('Conversion failed. Please try again.', 'error');
        } finally {
            this.isConverting = false;
            this.convertBtn.disabled = false;
            this.convertBtn.innerHTML = '<span>✨ Convert Image</span>';
        }
    }

    getOutputDimensions() {
        const resizeMode = document.querySelector('input[name="resize"]:checked').value;
        let width = this.originalImageData.width;
        let height = this.originalImageData.height;
        
        if (resizeMode === 'percentage') {
            const scale = parseInt(this.resizePercentage.value) / 100;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        } else if (resizeMode === 'pixels') {
            width = parseInt(this.targetWidth.value) || width;
            height = parseInt(this.targetHeight.value) || height;
        }
        
        return { width, height };
    }

    drawConvertedPreview(sourceCanvas) {
        const canvas = this.convertedCanvas;
        const ctx = canvas.getContext('2d');
        
        // Calculate preview size
        const maxSize = 300;
        const scale = Math.min(maxSize / sourceCanvas.width, maxSize / sourceCanvas.height);
        canvas.width = sourceCanvas.width * scale;
        canvas.height = sourceCanvas.height * scale;
        
        ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
    }

    showConversionResults(convertedBytes) {
        this.convertedSize.textContent = this.formatFileSize(convertedBytes);
        
        // Calculate compression ratio
        const originalBytes = this.originalImageData.size;
        const compressionRatio = ((originalBytes - convertedBytes) / originalBytes) * 100;
        
        if (Math.abs(compressionRatio) > 1) {
            this.compressionInfo.textContent = compressionRatio > 0 
                ? `↓ ${Math.round(compressionRatio)}% smaller`
                : `↑ ${Math.round(Math.abs(compressionRatio))}% larger`;
            this.compressionInfo.className = compressionRatio > 0 
                ? 'compression-info positive' 
                : 'compression-info negative';
        } else {
            this.compressionInfo.textContent = '≈ Same size';
            this.compressionInfo.className = 'compression-info';
        }
        
        this.previewSection.classList.remove('hidden');
    }

    showActionButtons() {
        this.downloadBtn.classList.remove('hidden');
        this.saveBtn.classList.remove('hidden');
    }

    downloadImage() {
        if (!this.convertedDataUrl) return;
        
        const format = document.querySelector('input[name="format"]:checked').value;
        const link = document.createElement('a');
        link.download = `converted_image.${format}`;
        link.href = this.convertedDataUrl;
        link.click();
        
        this.showNotification('Image downloaded successfully!', 'success');
    }

    saveToHistory() {
        if (!this.convertedDataUrl) return;
        
        try {
            // Use Chrome storage if available, otherwise localStorage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get('screenshots', (data) => {
                    const screenshots = data.screenshots || [];
                    const newScreenshot = {
                        id: Date.now().toString(),
                        dataUrl: this.convertedDataUrl,
                        timestamp: new Date().toISOString(),
                        type: 'converted-image'
                    };
                    
                    screenshots.unshift(newScreenshot);
                    chrome.storage.local.set({ screenshots });
                    this.showNotification('Image saved to history!', 'success');
                });
            } else {
                // Fallback to localStorage
                const screenshots = JSON.parse(localStorage.getItem('vue-screenshot-history') || '[]');
                const newScreenshot = {
                    id: Date.now().toString(),
                    dataUrl: this.convertedDataUrl,
                    timestamp: new Date().toISOString(),
                    type: 'converted-image'
                };
                
                screenshots.unshift(newScreenshot);
                localStorage.setItem('vue-screenshot-history', JSON.stringify(screenshots));
                this.showNotification('Image saved to history!', 'success');
            }
        } catch (error) {
            console.error('Failed to save to history:', error);
            this.showNotification('Failed to save to history', 'error');
        }
    }

    clearAll() {
        // Reset all state
        this.originalImage = null;
        this.originalImageData = null;
        this.convertedDataUrl = null;
        
        // Reset UI
        this.uploadPlaceholder.classList.remove('hidden');
        this.imagePreview.classList.add('hidden');
        this.conversionControls.classList.add('hidden');
        this.previewSection.classList.add('hidden');
        this.downloadBtn.classList.add('hidden');
        this.saveBtn.classList.add('hidden');
        
        // Reset form
        this.fileInput.value = '';
        document.querySelector('input[name="format"][value="jpeg"]').checked = true;
        document.querySelector('input[name="resize"][value="none"]').checked = true;
        this.qualitySlider.value = 85;
        this.qualityValue.textContent = '85';
        this.resizePercentage.value = 100;
        this.maintainRatio.checked = true;
        
        // Reset visual states
        document.querySelectorAll('.format-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.format-option[data-format="jpeg"]').classList.add('selected');
        
        this.percentageInputs.classList.add('hidden');
        this.pixelInputs.classList.add('hidden');
        this.qualitySection.classList.add('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageConverter();
}); 