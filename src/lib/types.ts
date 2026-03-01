export type FilterType = 
  | 'none'
  | 'crt'
  | 'vhs'
  | 'gameboy'
  | 'nes'
  | 'glitch'
  | 'arcade';

export type ColorPalette = 
  | 'original'
  | 'fire'
  | 'luigi'
  | 'ice'
  | 'gold'
  | 'monochrome';

export interface FilterSettings {
  type: FilterType;
  intensity: number;
}

export interface ColorSettings {
  palette: ColorPalette;
  hue: number;
  saturation: number;
  brightness: number;
}

export interface PixelSettings {
  pixelation: number;
  colorDepth: number;
  dithering: number;
}

export interface Sticker {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface EditorState {
  filter: FilterSettings;
  color: ColorSettings;
  pixel: PixelSettings;
  stickers: Sticker[];
}
