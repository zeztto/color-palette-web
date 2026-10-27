import { RGB, HSL, CMYK } from './colorConversions';

export interface ExportColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  cmyk: CMYK;
}

export class ColorExporter {
  /**
   * CSS 변수 형식으로 변환
   */
  static toCSS(colors: Map<string, ExportColor>): string {
    let css = ':root {\n';
    colors.forEach((color, name) => {
      const safeName = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      css += `  --color-${safeName}: ${color.hex};\n`;
      css += `  --color-${safeName}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
    });
    css += '}\n';
    return css;
  }

  /**
   * JSON 형식으로 변환
   */
  static toJSON(colors: Map<string, ExportColor>): string {
    const obj: Record<string, any> = {};
    colors.forEach((color, name) => {
      obj[name] = {
        hex: color.hex,
        rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
        cmyk: `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`
      };
    });
    return JSON.stringify(obj, null, 2);
  }

  /**
   * Figma 플러그인 형식으로 변환
   */
  static toFigma(colors: Map<string, ExportColor>): string {
    const figmaColors = Array.from(colors.entries()).map(([name, color]) => ({
      name,
      color: {
        r: color.rgb.r / 255,
        g: color.rgb.g / 255,
        b: color.rgb.b / 255,
        a: 1
      }
    }));
    return JSON.stringify({ colors: figmaColors }, null, 2);
  }

  /**
   * 파일 다운로드
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }
}
