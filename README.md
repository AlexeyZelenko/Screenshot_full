# Vue Screenshot Extension

A powerful Chrome extension for taking screenshots with advanced Fabric.js-powered editing capabilities.

## ✨ Features

### 📸 Screenshot Capture
- **Visible Area**: Capture the currently visible part of the page
- **Full Page**: Capture the entire webpage (including scrollable content)
- **Area Selection**: Select a specific area to capture
- **Test Function**: Create dummy screenshots for testing

### 🎨 Advanced Image Editor (Fabric.js)
- **Drawing Tools**: Free drawing, rectangles, circles, arrows, text
- **Customization**: Adjustable colors, stroke width, font size, opacity
- **Image Filters**: Grayscale, sepia, invert, blur, brightness, contrast
- **History**: Undo/redo functionality (up to 20 actions)
- **Export**: Download edited screenshots as PNG files

### 💾 Storage & History
- Automatic local storage of screenshots
- View and manage screenshot history
- Open screenshots in the advanced editor

## 🚀 Installation

### Method 1: Load Unpacked Extension (Recommended)

1. **Build the project**:
   ```bash
   npm install
   npm run build
   ```

2. **Open Chrome Extensions**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Update the extension** (after making changes):
   - Run `npm run build` again
   - Click the refresh button next to the extension in `chrome://extensions/`

### Method 2: Development Mode

For development with hot reload:
```bash
npm run dev
```
Then open `http://localhost:5173` in your browser.

## 🔧 Usage

### Taking Screenshots

1. **Click the extension icon** in the Chrome toolbar
2. **Choose capture method**:
   - "Capture Visible Area" - Screenshots the current viewport
   - "Capture Full Page" - Screenshots the entire page
   - "Capture Area" - Select a specific region
   - "Create Test Screenshot" - Generate a dummy screenshot for testing

### Editing Screenshots

1. **View a screenshot** from the history tab
2. **Click "Edit"** to open the advanced Fabric.js editor
3. **Use the tools** in the top toolbar:
   - **Select** (👆): Move and select objects
   - **Draw** (✏️): Free drawing
   - **Rectangle** (⬜): Add rectangular shapes
   - **Circle** (⭕): Add circular shapes
   - **Arrow** (➡️): Add arrows
   - **Text** (📝): Add text annotations

4. **Customize** with the available options:
   - **Colors**: Choose from 12 preset colors
   - **Stroke Width**: Adjust line thickness (1-20px)
   - **Font Size**: Text size (12-72px)
   - **Opacity**: Transparency (10-100%)

5. **Apply Filters** to the base image:
   - Grayscale, Sepia, Invert, Blur, Brightness, Contrast

6. **Manage your work**:
   - **Undo/Redo**: Navigate through up to 20 actions
   - **Delete**: Remove selected objects
   - **Clear All**: Start over
   - **Download**: Save your edited screenshot

## 🎯 Keyboard Shortcuts

- `Alt+S`: Take a screenshot of the visible area
- `Alt+F`: Take a full page screenshot

## 🛠️ Technical Details

### Built With
- **Vue 3** with Composition API and TypeScript
- **Fabric.js v5** for advanced canvas editing
- **Vite** for fast development and building
- **Pinia** for state management
- **Chrome Extension Manifest V3**

### Permissions
- `activeTab`: Access to the current tab for screenshots
- `tabs`: Required for screenshot functionality
- `storage`: Save screenshots locally
- `downloads`: Allow downloading edited images

### Project Structure
```
├── src/
│   ├── components/         # Vue components
│   │   ├── ScreenshotControls.vue    # Capture interface
│   │   ├── ScreenshotHistory.vue     # History management
│   │   ├── ScreenshotPreview.vue     # Image preview
│   │   └── ScreenshotEditor.vue      # Fabric.js editor
│   ├── stores/            # Pinia stores
│   └── background.ts      # Service worker
├── public/
│   └── manifest.json      # Extension manifest
└── dist/                  # Built extension files
```

## 🐛 Troubleshooting

### Screenshots Not Working
- **Error**: "Either the '<all_urls>' or 'activeTab' permission is required"
- **Solution**: Make sure you have the latest version of the extension with proper permissions

### Test Screenshot Feature
- Use the "Create Test Screenshot" button to verify the extension is working
- This creates a dummy gradient screenshot for testing purposes

### Storage Issues
- Screenshots are saved automatically to Chrome's local storage
- Clear the extension data in `chrome://extensions/` if you encounter storage problems

### Editor Not Opening
- Make sure the editor files are properly built in the `dist` folder
- Check the browser console for any JavaScript errors

## 🔄 Updates

To update the extension after making changes:

1. **Rebuild**:
   ```bash
   npm run build
   ```

2. **Refresh the extension**:
   - Go to `chrome://extensions/`
   - Find "Vue Screenshot" extension
   - Click the refresh/reload button

3. **Clear cache** (if needed):
   - Right-click extension icon → "Inspect popup"
   - Open DevTools → Application → Storage → Clear storage

## 📝 Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome browser

### Setup
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at the browser console for error messages
3. Ensure you're using the latest version
4. Create an issue with detailed information about the problem
