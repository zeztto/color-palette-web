import { isValidHSLString } from './colorConversions';

export class ColorURLShare {
  /**
   * HSL 문자열을 URL 안전 형식으로 인코딩
   * "hsl(180, 50%, 50%)" -> "180-50-50"
   */
  static encodeColor(hslString: string): string {
    if (!isValidHSLString(hslString)) return '';
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
  }

  /**
   * URL 파라미터를 HSL 문자열로 디코딩
   */
  static decodeColor(encoded: string): string | null {
    if (!/^\d{1,3}-\d{1,3}-\d{1,3}$/.test(encoded)) return null;
    const parts = encoded.split('-');
    if (parts.length !== 3) return null;

    const [h, s, l] = parts.map(Number);

    // 범위 검증
    if (isNaN(h) || isNaN(s) || isNaN(l)) return null;
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;

    const hslString = `hsl(${h}, ${s}%, ${l}%)`;
    return isValidHSLString(hslString) ? hslString : null;
  }

  /**
   * 현재 색상을 URL에 반영
   */
  static setColorInURL(color: string): void {
    const encoded = this.encodeColor(color);
    if (encoded) {
      const url = new URL(window.location.href);
      url.searchParams.set('color', encoded);
      window.history.replaceState({}, '', url.toString());
    }
  }

  /**
   * URL에서 색상 읽기
   */
  static getColorFromURL(): string | null {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('color');
      return encoded ? this.decodeColor(encoded) : null;
    } catch (error) {
      console.error('Failed to parse color from URL:', error);
      return null;
    }
  }

  /**
   * 공유 URL 생성
   */
  static generateShareURL(color: string): string {
    const encoded = this.encodeColor(color);
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('color', encoded);
    return url.toString();
  }
}
