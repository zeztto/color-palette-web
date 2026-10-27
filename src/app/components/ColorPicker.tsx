import { useState, useMemo, useCallback } from 'react';
import {
  generateColorPaletteForHue,
  generateHuePalette,
  generateGrayscale
} from '../utils/colorConversions';

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [selectedHueIndex, setSelectedHueIndex] = useState<number>(0); // 기본값: 첫 번째 색조
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // 선택된 색상
  // Memoize expensive color generation
  const grays = useMemo(() => generateGrayscale(), []);
  const hues = useMemo(() => generateHuePalette(), []);
  
  const colors = useMemo(() => {
    // 선택된 색조의 팔레트만 반환 (400색)
    return generateColorPaletteForHue(selectedHueIndex);
  }, [selectedHueIndex]);

  // useCallback으로 함수 메모이제이션
  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  }, [onColorSelect]);

  return (
    <div className="w-full space-y-4">
      {/* 그레이스케일 - 20단계 */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 w-full">
        <h3 className="mb-3">그레이스케일</h3>
        <div className="color-swatch-grid">
          {grays.map((color, index) => (
            <button
              key={`gray-${index}`}
              className={`transition-transform hover:scale-150 hover:z-10 relative rounded-sm border ${
                selectedColor === color 
                  ? 'border-foreground border-2' 
                  : 'border-border/30'
              }`}
              style={{ 
                backgroundColor: color
              }}
              onClick={() => handleColorSelect(color)}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              title={color}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* 색조 선택 + 색상 팔레트 */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 w-full space-y-3">
        <div>
          <div className="color-swatch-grid">
            {hues.map((color, index) => (
              <button
                key={`hue-${index}`}
                className={`transition-all hover:scale-150 hover:z-10 relative rounded-sm border ${
                  selectedHueIndex === index 
                    ? 'border-foreground border-2 scale-110 z-10' 
                    : 'border-border/30'
                }`}
                style={{ 
                  backgroundColor: color
                }}
                onClick={() => setSelectedHueIndex(index)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                title={`색조 ${index + 1}: ${color}`}
                aria-label={`색조 ${index + 1}: ${color}`}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="color-swatch-grid">
            {colors.map((color, index) => (
              <button
                key={index}
                className={`transition-transform hover:scale-150 hover:z-10 relative rounded-sm border ${
                  selectedColor === color 
                    ? 'border-foreground border-2' 
                    : 'border-border/20'
                }`}
                style={{ 
                  backgroundColor: color
                }}
                onClick={() => handleColorSelect(color)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                title={color}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
