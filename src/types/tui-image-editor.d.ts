declare module 'tui-image-editor' {
  interface IThemeConfig {
    [key: string]: string;
  }

  interface ILoadImageInfo {
    path: string;
    name: string;
  }

  interface IIncludeUIOptions {
    loadImage?: ILoadImageInfo;
    theme?: IThemeConfig;
    menu?: string[];
    initMenu?: string;
    uiSize?: {
      width: string | number;
      height: string | number;
    };
    menuBarPosition?: 'top' | 'bottom' | 'left' | 'right';
  }

  interface IImageEditorOptions {
    includeUI?: IIncludeUIOptions;
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    usageStatistics?: boolean;
  }

  export default class ImageEditor {
    constructor(element: HTMLElement, options?: IImageEditorOptions);
    
    destroy(): void;
    toDataURL(options?: { format?: string; quality?: number }): string;
    loadImageFromURL(url: string, imageName: string): Promise<any>;
    clearUndoStack(): void;
    clearRedoStack(): void;
    undo(): Promise<any>;
    redo(): Promise<any>;
  }
} 