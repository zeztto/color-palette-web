import { isValidHSLString } from './colorConversions';

export interface SavedColor {
  color: string;
  timestamp: number;
  label?: string;
}

const FAVORITES_KEY = 'color-palette-favorites';
const HISTORY_KEY = 'color-palette-history';
const MAX_HISTORY = 20;
const MAX_FAVORITES = 50;

export class ColorStorage {
  /**
   * 즐겨찾기 목록 가져오기
   */
  static getFavorites(): SavedColor[] {
    return this.readColors(FAVORITES_KEY, MAX_FAVORITES).colors;
  }

  /**
   * 즐겨찾기 추가
   */
  static addFavorite(color: string, label?: string): boolean {
    try {
      if (!isValidHSLString(color)) return false;
      const stored = this.readColors(FAVORITES_KEY, MAX_FAVORITES);
      if (!stored.valid) return false;
      const favorites = stored.colors;

      // 중복 체크
      if (favorites.some(f => f.color === color)) {
        return false;
      }

      // 최대 개수 체크
      if (favorites.length >= MAX_FAVORITES) {
        throw new Error('즐겨찾기가 가득 찼습니다');
      }

      favorites.unshift({
        color,
        timestamp: Date.now(),
        label
      });

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }

  /**
   * 즐겨찾기 제거
   */
  static removeFavorite(color: string): boolean {
    try {
      const stored = this.readColors(FAVORITES_KEY, MAX_FAVORITES);
      if (!stored.valid) return false;
      const favorites = stored.colors.filter(f => f.color !== color);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 즐겨찾기 여부 확인
   */
  static isFavorite(color: string): boolean {
    return this.getFavorites().some(f => f.color === color);
  }

  /**
   * 히스토리 목록 가져오기
   */
  static getHistory(): SavedColor[] {
    return this.readColors(HISTORY_KEY, MAX_HISTORY).colors;
  }

  /**
   * 히스토리에 색상 추가
   */
  static addToHistory(color: string): void {
    try {
      if (!isValidHSLString(color)) return;
      const stored = this.readColors(HISTORY_KEY, MAX_HISTORY);
      if (!stored.valid) return;
      let history = stored.colors;

      // 중복 제거 (최신으로 이동)
      history = history.filter(h => h.color !== color);

      // 최신 항목 추가
      history.unshift({
        color,
        timestamp: Date.now()
      });

      // 최대 개수 제한 (FIFO)
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  }

  /**
   * 히스토리 삭제
   */
  static clearHistory(): boolean {
    try {
      if (!this.readColors(HISTORY_KEY, MAX_HISTORY).valid) return false;
      localStorage.removeItem(HISTORY_KEY);
      return true;
    } catch {
      return false;
    }
  }

  static getStorageError(): string | null {
    return this.readColors(FAVORITES_KEY, MAX_FAVORITES).valid && this.readColors(HISTORY_KEY, MAX_HISTORY).valid
      ? null
      : '저장된 색상 데이터를 읽을 수 없습니다. 원본을 유지하기 위해 손상된 목록의 변경을 중단했습니다.';
  }

  private static readColors(key: string, limit: number): { colors: SavedColor[]; valid: boolean } {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return { colors: [], valid: true };
      const parsed: unknown = JSON.parse(item);
      if (!Array.isArray(parsed) || parsed.length > limit) return { colors: [], valid: false };
      const valid = parsed.every((entry) =>
        entry !== null && typeof entry === 'object' &&
        typeof entry.color === 'string' && isValidHSLString(entry.color) &&
        typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp) &&
        (entry.label === undefined || typeof entry.label === 'string')
      );
      return valid ? { colors: parsed, valid: true } : { colors: [], valid: false };
    } catch {
      return { colors: [], valid: false };
    }
  }
}
