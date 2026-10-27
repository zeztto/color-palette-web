export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

/**
 * XSS 방지를 위한 입력 새니타이제이션
 */
export function sanitizeColorInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * HSL 문자열 형식 검증
 */
export function isValidHSLString(hsl: string): boolean {
  const match = /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/.exec(hsl);
  return !!match && Number(match[1]) <= 360 && Number(match[2]) <= 100 && Number(match[3]) <= 100;
}

/**
 * HEX 색상 검증
 */
export function isValidHexColor(hex: string): boolean {
  const pattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  return pattern.test(hex);
}

/**
 * RGB 값 범위 검증
 */
export function isValidRGB(rgb: RGB): boolean {
  return rgb.r >= 0 && rgb.r <= 255 &&
         rgb.g >= 0 && rgb.g <= 255 &&
         rgb.b >= 0 && rgb.b <= 255;
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  const sanitized = sanitizeColorInput(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sanitized);

  if (!result) {
    console.warn(`Invalid hex color: ${hex}`);
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export function generateColorPalette(): string[] {
  const colors: string[] = [];
  
  // 색상 팔레트 생성
  // Hue: 0-360도를 25단계로
  // Saturation: 4%부터 100%까지 25단계 (0% 제외 - 그레이스케일 중복 방지)
  // Lightness: 3.85%부터 96.15%까지 25단계 (0%와 100% 제외 - 그레이스케일 중복 방지)
  
  const hues = 25;
  const saturations = 25;
  const lightnessSteps = 27; // 0부터 26까지, 그 중 1부터 25까지 사용
  
  // 총 25 × 25 × 25 = 15,625색상 (명도 0%, 100% 제외)
  for (let i = 0; i < hues; i++) {
    const h = Math.round((360 / hues) * i);
    for (let j = 0; j < saturations; j++) {
      const s = Math.round(((j + 1) / saturations) * 100); // 4%, 8%, 12%, ..., 100%
      for (let k = 1; k <= 25; k++) { // 1부터 25까지 (0과 26 제외)
        const l = Math.round((k / (lightnessSteps - 1)) * 100);
        colors.push(`hsl(${h}, ${s}%, ${l}%)`);
      }
    }
  }
  
  return colors;
}

// 특정 색조에 대한 팔레트 생성
export function generateColorPaletteForHue(hueIndex: number): string[] {
  const colors: string[] = [];
  
  const hues = 21; // 21단계로 나누되 20단계까지만 사용 (마지막은 첫 번째와 동일)
  const saturations = 20;
  const lightnessSteps = 20;
  
  const h = Math.round((360 / hues) * hueIndex);
  
  // 20 × 20 = 400색상 (채도 × 명도, 명도 0%, 100% 제외)
  for (let j = 0; j < saturations; j++) {
    const s = Math.round(((j + 1) / saturations) * 100); // 5%, 10%, 15%, ..., 100%
    for (let k = 0; k < lightnessSteps; k++) {
      const l = Math.round(((k + 1) / (lightnessSteps + 1)) * 100); // 4.76%, 9.52%, ..., 95.24%
      colors.push(`hsl(${h}, ${s}%, ${l}%)`);
    }
  }
  
  return colors;
}

// 색조 팔레트 생성 (20단계, 채도 100%, 명도 50%)
export function generateHuePalette(): string[] {
  const hues = 21; // 21단계로 나누되 20단계까지만 사용
  const palette: string[] = [];
  
  for (let i = 0; i < hues - 1; i++) { // 마지막 단계는 제외 (첫 번째와 동일)
    const h = Math.round((360 / hues) * i);
    palette.push(`hsl(${h}, 100%, 50%)`);
  }
  
  return palette;
}

// 1번: 명도 우선 정렬 (밝은 색 → 어두운 색)
export function generateColorPaletteBySortLightness(): string[] {
  const colors: string[] = [];
  
  const hues = 25;
  const saturations = 25;
  const lightnessSteps = 27;
  
  // 명도 → 색조 → 채도 순서로 생성 (명도 0%, 100% 제외)
  for (let k = 1; k <= 25; k++) { // 1부터 25까지
    const l = Math.round((k / (lightnessSteps - 1)) * 100);
    for (let i = 0; i < hues; i++) {
      const h = Math.round((360 / hues) * i);
      for (let j = 0; j < saturations; j++) {
        const s = Math.round(((j + 1) / saturations) * 100);
        colors.push(`hsl(${h}, ${s}%, ${l}%)`);
      }
    }
  }
  
  return colors;
}

// 2번: 채도 우선 정렬 (선명한 색 → 흐린 색)
export function generateColorPaletteBySortSaturation(): string[] {
  const colors: string[] = [];
  
  const hues = 25;
  const saturations = 25;
  const lightnessSteps = 27;
  
  // 채도 → 색조 → 명도 순서로 생성 (높은 채도부터, 명도 0%, 100% 제외)
  for (let j = saturations - 1; j >= 0; j--) {
    const s = Math.round(((j + 1) / saturations) * 100);
    for (let i = 0; i < hues; i++) {
      const h = Math.round((360 / hues) * i);
      for (let k = 1; k <= 25; k++) { // 1부터 25까지
        const l = Math.round((k / (lightnessSteps - 1)) * 100);
        colors.push(`hsl(${h}, ${s}%, ${l}%)`);
      }
    }
  }
  
  return colors;
}

// 3번: 색조 그룹화 (색상환 순서)
export function generateColorPaletteBySortHue(): string[] {
  const colors: string[] = [];
  
  const hues = 25;
  const saturations = 25;
  const lightnessSteps = 27;
  
  // 색조 → 명도 → 채도 순서로 생성 (명도 0%, 100% 제외)
  for (let i = 0; i < hues; i++) {
    const h = Math.round((360 / hues) * i);
    for (let k = 1; k <= 25; k++) { // 1부터 25까지
      const l = Math.round((k / (lightnessSteps - 1)) * 100);
      for (let j = 0; j < saturations; j++) {
        const s = Math.round(((j + 1) / saturations) * 100);
        colors.push(`hsl(${h}, ${s}%, ${l}%)`);
      }
    }
  }
  
  return colors;
}

export function generateGrayscale(): string[] {
  const grays: string[] = [];
  // 그레이스케일 생성 - 20단계
  for (let i = 0; i < 20; i++) {
    const lightness = Math.round((i / 19) * 100);
    grays.push(`hsl(0, 0%, ${lightness}%)`);
  }
  return grays;
}

export function hslStringToRgb(hslString: string): RGB {
  if (!isValidHSLString(hslString)) return { r: 0, g: 0, b: 0 };
  const match = hslString.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  let r, g, b;
  
  if (s === 0) {
    // 그레이스케일: RGB 값이 모두 같음
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
