import { useState, useEffect, useCallback } from 'react';
import { ColorStorage, SavedColor } from '../utils/colorStorage';
import { ColorExporter, ExportColor } from '../utils/colorExport';
import { hslStringToRgb, rgbToHex, rgbToHsl, rgbToCmyk } from '../utils/colorConversions';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Star, Trash2, History, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ColorHistoryProps {
  currentColor: string | null;
  onColorSelect: (color: string) => void;
}

export function ColorHistory({ currentColor, onColorSelect }: ColorHistoryProps) {
  const [favorites, setFavorites] = useState<SavedColor[]>([]);
  const [history, setHistory] = useState<SavedColor[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setFavorites(ColorStorage.getFavorites());
    setHistory(ColorStorage.getHistory());
    setStorageError(ColorStorage.getStorageError());
  }, []);

  useEffect(() => {
    if (currentColor) ColorStorage.addToHistory(currentColor);
    loadData();
  }, [currentColor, loadData]);

  const toggleFavorite = () => {
    if (!currentColor) return;

    const isFav = ColorStorage.isFavorite(currentColor);
    if (isFav) {
      const removed = ColorStorage.removeFavorite(currentColor);
      if (removed) toast.success('즐겨찾기에서 제거되었습니다');
      else toast.error('즐겨찾기 제거에 실패했습니다');
    } else {
      const success = ColorStorage.addFavorite(currentColor);
      if (success) {
        toast.success('즐겨찾기에 추가되었습니다');
      } else {
        toast.error('즐겨찾기 추가에 실패했습니다');
      }
    }
    loadData();
  };

  const clearHistory = () => {
    if (!ColorStorage.clearHistory()) {
      toast.error('히스토리 삭제에 실패했습니다');
      return;
    }
    setHistory([]);
    toast.success('히스토리가 삭제되었습니다');
  };

  const exportFavorites = (format: 'css' | 'json' | 'figma') => {
    if (favorites.length === 0) {
      toast.error('내보낼 색상이 없습니다. 즐겨찾기에 색상을 추가하세요.');
      return;
    }

    try {
      // 색상 변환
      const colorMap = new Map<string, ExportColor>();
      favorites.forEach((saved, index) => {
        const rgb = hslStringToRgb(saved.color);
        const name = saved.label || `color-${index + 1}`;
        colorMap.set(name, {
          hex: rgbToHex(rgb),
          rgb,
          hsl: rgbToHsl(rgb),
          cmyk: rgbToCmyk(rgb)
        });
      });

      // 형식에 따라 내보내기
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'css':
          content = ColorExporter.toCSS(colorMap);
          filename = 'colors.css';
          mimeType = 'text/css';
          break;
        case 'json':
          content = ColorExporter.toJSON(colorMap);
          filename = 'colors.json';
          mimeType = 'application/json';
          break;
        case 'figma':
          content = ColorExporter.toFigma(colorMap);
          filename = 'figma-colors.json';
          mimeType = 'application/json';
          break;
      }

      ColorExporter.downloadFile(content, filename, mimeType);
      toast.success(`${filename} 파일이 다운로드되었습니다`);
    } catch (error) {
      toast.error('내보내기에 실패했습니다');
      console.error('Export error:', error);
    }
  };

  const isFavorited = currentColor ? ColorStorage.isFavorite(currentColor) : false;

  return (
    <Card className="p-3 sm:p-4 w-full">
      <div className="space-y-3">
        {storageError && <p role="alert" className="text-sm text-destructive">{storageError}</p>}
        {/* 즐겨찾기 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Star className="w-4 h-4" />
            즐겨찾기 ({favorites.length})
          </h3>
          <div className="flex gap-1 sm:gap-2">
            {favorites.length > 0 && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => exportFavorites('css')}
                  title="CSS로 내보내기"
                  className="h-8 text-xs px-2"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSS
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => exportFavorites('json')}
                  title="JSON으로 내보내기"
                  className="h-8 text-xs px-2"
                >
                  JSON
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => exportFavorites('figma')}
                  title="Figma 형식으로 내보내기"
                  className="h-8 text-xs px-2"
                >
                  Figma
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant={isFavorited ? "default" : "outline"}
              onClick={toggleFavorite}
              disabled={!currentColor || !!storageError}
              className="h-8 text-xs px-2"
            >
              {isFavorited ? '해제' : '추가'}
            </Button>
          </div>
        </div>

        {/* 즐겨찾기 목록 */}
        {favorites.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {favorites.map((saved, index) => (
              <button
                key={index}
                className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: saved.color }}
                onClick={() => onColorSelect(saved.color)}
                title={saved.label || saved.color}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            색상을 선택하고 즐겨찾기에 추가해보세요
          </p>
        )}

        {/* 최근 사용 */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <History className="w-4 h-4" />
              최근 사용 ({history.length}/{MAX_HISTORY})
            </h3>
            {history.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearHistory}
                aria-label="최근 사용 삭제"
                className="h-7 w-7 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {history.map((saved, index) => (
                <button
                  key={index}
                  className="flex-shrink-0 w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: saved.color }}
                  onClick={() => onColorSelect(saved.color)}
                  title={saved.color}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              사용한 색상이 자동으로 저장됩니다
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

const MAX_HISTORY = 20;
